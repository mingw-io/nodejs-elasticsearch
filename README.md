# nodejs-elasticsearch
NodeJS // Elasticsearch // REST-API

This example demonstrates how to combine NodeJS and Elasticsearch via a RESTful application.

**Dependencies**

* Node
* Elastichsearch

**Installation**

git clone https://github.com/mingw-io/nodejs-elasticsearch

**Steps**

* Start ElasticSearch Server (elasticsearch.bat on Windows)

* Start NodeJS server

* Verify the NodeJS app: http://localhost/  & https://localhost:3001/

* Run Postman application
             (Remember to go to: Settings - Settings - Certificates - Add rootca.pem)

* Make the following request: POST https://localhost:3001/api/v1/create-index

* POST https://localhost:3001/api/v1/create-table

* GET https://localhost:3001/api/v1/students

* POST https://localhost:3001/api/v1/students

**TLS Certificates**

![image](https://user-images.githubusercontent.com/70483213/155897476-7b8b973e-8191-4527-8342-a0fdb1e048c7.png)


![image](https://user-images.githubusercontent.com/70483213/155897519-e67aa566-9c2e-4b8c-870f-870e0d327b12.png)
