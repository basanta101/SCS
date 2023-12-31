
# SCS: Simple Cloud Storage
A simple file managing system that allows user to upload and download their files.

## Docker tag
https://hub.docker.com/r/bit121/simple-file-storage/tags

## Postman collection
The postman collections is added to the repo, with a filename of SCS.postman_collection.json.

## Tech Stack

**Server:** Node, Express
##
Node version: v20.8.1

## Run Locally
Clone the project
```bash
  git clone https://github.com/basanta101/SCS.git
```
Go to the project directory

```bash
  cd SCS
```
Install dependencies
```bash
  npm install
```
Start the dev server
```bash
  npm run dev
```

## API Reference
#### register: register a user

```http
  POST /register
```

| Req-body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Required**. Your email |
| `password` | `string` | **Required**. Your password |

#### login: user login

```http
  POST /login
```

| Req-body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Required**. Your email |
| `password` | `string` | **Required**. Your password |

#
### The following apis require login
#### upload: upload files

```http
  POST /upload
```
| Query-params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `destination`| `string` | **Required**. /path/to/file.  |
| `user`| `string` | **Required**. user uploading the file|
| `access`| `string` | **Required**. access type of the file|


| Req-body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `file`      | `file` | **Required**. Files to be uploaded|

#### download: download files

```http
  GET /download
```
| Query-params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `filename`| `string` | **Required**. location to store the file|
| `destination`| `string` | **Required**. path/to/file.    |
| `user`| `string` | **Required**. user trying to download the file|

#### files: search for files in a folder
```http
  GET /files 
```
| Query-params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `filename`| `string` | **Required**. location to store the file|
| `user`| `string` | **Required**. user trying to download the file|


#### list: list all files uploaded by the user
```http
  GET /list 
```
| Query-params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `user`| `string` | **Required**. user who uploaded the file|
