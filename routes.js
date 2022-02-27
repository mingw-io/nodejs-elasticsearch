const express = require('express');

const router =  express.Router();

const elastic = require('elasticsearch');

const bodyParser = require('body-parser').json();

const elasticClient = elastic.Client({
  host: 'localhost:9200'
//  log: 'trace'
});

async function checkIndices() {
	try {
    let does_exist = await elasticClient.indices.exists({index: 'students'});
    console.log('created index: ', does_exist);
    return does_exist;
   } catch (e) {
      if (e.status === 400) {
        console.log('index alread exists');
      } else {
        throw e;
      }
    }

	return true;
};

async function createIndex() {
	try {
		let new_index = await elasticClient.indices.create({index: 'students'});
        return new_index;
	} catch (e) {
        return false;
	}

    return true;
};

async function deleteIndex() {
    try {
		let delete_index = await elasticClient.indices.delete({index: 'students'});
		return true;
	} catch (e) {
		return false;
	}

    return true;
}


// type: 'people',
async function createStudentTable() {
    try {
		let new_table = await elasticClient.indices.putMapping({
        index: 'students',
        body: {
        properties: { 
            firstname: { type: 'text' },
            lastname: { type: 'text' },
            email: { type: 'text' },
            phone_number: { type: 'text' },
            created_on: { type: 'date' },
            updated_at: { type: 'date' } }
        }
        });
		// { acknowledged: true }
		console.log('[createStudentTable] ', new_table);

		return true;
	} catch (e) {
		console.log('[createStudentTable] ERR: ', e);

		return false;
	}
}

// TODO:
async function populateStudentTable() {
	try {
		let new_insert = await elasticClient.index({
			index: 'students',
            id: '1',
            body: {
    "firstname": "John",
    "lastname": "CITIZEN",
    "email": "john.citizen@acme.edu.au"
            }
		});

//{
//  _index: 'students',
//  _type: '_doc',
//  _id: '1',
//  _version: 1,
//  result: 'created',
//  _shards: { total: 2, successful: 1, failed: 0 },
//  _seq_no: 3,
//  _primary_term: 1
//}
		console.log(new_insert);
		
		return true;
	} catch (e) {
		console.log(e);

		return false;
	}

}

//         type: 'people',
async function getStudents() {
    await elasticClient.search({
        index: 'students',
        body: {
          query: {
            match: {
              body: 'firstname'
            }
          }
        }
    })
    .then(res => console.log(res))
    .catch(err => console.log(err));
};

router.use((req, res, next) => {
  elasticClient.index({
    index: 'logs',
    body: {
      url: req.url,
      method: req.method,
    }
  })
  .then(res=>{
    console.log('Logs indexed')
  })
  .catch(err=>{
    console.log(err)
  })
  next();
});


router.get('/students', (req, res)=>{
  let query = {
    index: 'students'
  }
  console.log('req.query: ', req.query);
  if (req.query.student) query.q =  `*${req.query.student}*`;
  elasticClient.search(query)
  .then(resp=>{
    return res.status(200).json({
      students: resp.hits.hits
    });
  })
  .catch(err=>{
    console.log(err);
    return res.status(500).json({
      msg: 'Error',
      err
    });
  });
});

router.get('/students/:id', (req, res)=>{
  let query = {
    index: 'students',
    id: req.params.id
  }
  elasticClient.get(query)
  .then(resp=>{
    if(!resp){
      return res.status(404).json({
        student: resp
      });
    }
    return res.status(200).json({
      student: resp
    });
  })
  .catch(err=>{
    return res.status(500).json({
      msg: 'Error not found',
      err
    });
  });
});

router.put('/students/:id', bodyParser, (req, res)=>{
  elasticClient.update({
    index: 'students',
    id: req.params.id,
    body: {
      doc: req.body
    }
  })
  .then(resp=>{
    return res.status(200).json({
      msg: 'student updated'
    });
  })
  .catch(err=>{
    console.log(err)
    return res.status(500).json({
      msg: 'Error',
      err
    });
  })
});

router.post('/students', bodyParser, (req, res)=>{
	console.log('POST students: ', req.body);
	if (!req.body) {
		return res.status(500).json({msg: 'Error'});
	}
	if(!Object.keys(req.body).length) {
        // is empty
		return res.status(500).json({msg: 'Empty body!'});
	}

  elasticClient.index({
    index: 'students',
    body: req.body
  })
  .then(resp=>{
    return res.status(200).json({
      msg: 'student indexed'
    });
  })
  .catch(err=>{
    return res.status(500).json({
      msg: 'Error',
      err
    });
  })
});

router.post('/students-populate', bodyParser, (req, res)=>{
	console.log('POST students-populate: ', req.body);

    populateStudentTable()
    .then(resp=>{
    return res.status(200).json({
      msg: 'student indexed'
    });
  })
  .catch(err=>{
    return res.status(500).json({
      msg: 'Error',
      err
    });
  })
});

router.post("/create-index", bodyParser, (req, res) => {
  try {

	checkIndices().then(result => { 
	    console.log(result);
		if (result) {
			deleteIndex();
		}
	});

    createIndex().then( result => {
		if (result) {
			return res.status(200).json({
                msg: 'create-index successfully!'
            });
		}

		return res.status(500).json(result);
	});



  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post("/create-table", bodyParser, (req, res) => {
  try {

    checkIndices().then(result => { 
	    console.log('[create-table] ', result);
		if (!result) {
			return res.status(400).json({msg: 'NOT FOUND!'});
		}
	});

    createStudentTable().then( result => {
		console.log('[create-table bis] ', result);
		if (result) {
			return res.status(200).json({
                msg: 'create-table successfully!'
            });
		}

		return res.status(500).json(result);
	});

  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = {
	router: router,
	client: elasticClient
};