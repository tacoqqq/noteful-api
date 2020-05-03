const express = require('express');
const path = require('path');
const xss = require('xss');
const FoldersService = require('./folders-service');
const foldersRouter = express.Router();
const parseBody = express.json();

function sanitizedContent(content)  {
    return {
        id: content.id,
        folder_name: xss(content.folder_name),
        create_time: content.created_time
    }
}

foldersRouter
    .route('/')
    .get((req,res,next) => {
        const knexInstance = req.app.get('db');
        FoldersService.getAllFolders(knexInstance)
            .then(folders => {
                return res.status(200).json(folders.map(folder => sanitizedContent(folder)))
            })
            .catch(next)
    })
    .post(parseBody, (req,res,next) => {
        const knexInstance = req.app.get('db')
        const { folder_name } = req.body
        if (!folder_name) {
            return res.status(400).json({error:{message: `Must enter folder name to create a new folder!`}})
        }
        const newFolderInfo = { folder_name }
        console.log(newFolderInfo)
        FoldersService.createFolder(knexInstance,newFolderInfo)
            .then(addedFolder => {
                console.log('hello from response')
                res.status(201)
                    .location(path.posix.join(req.originalUrl , `/${addedFolder.id}` ))
                    .json(sanitizedContent(addedFolder))
            })
            .catch(next)
    })

foldersRouter
    .route('/:folderId')
    .all((req,res,next) => {
        const knexInstance = req.app.get('db')
        const { folderId } = req.params
        FoldersService.getFolderById(knexInstance,folderId)
            .then(folder => {
                if (!folder) {
                    return res.status(404).json({error:{message:`bad request: cannot find folder`}})
                }
                res.folder = folder
                next()
            })
            .catch(next)
    })
    .get((req,res) => {
        res.json(sanitizedContent(res.folder))
    })
    .delete((req,res,next) => {
        const knexInstance = req.app.get('db')
        const { folderId } = req.params
        FoldersService.deleteFolder(knexInstance, folderId)
            .then(response => {
                return res.status(204).end()
            }) 
    })
    .patch(parseBody, (req,res,next) => {
        const knexInstance = req.app.get('db')
        const { folderId } = req.params
        const { folder_name } = req.body
        if (!folder_name) {
            return res.status(400).json({error:{message:`invalid request: must include nwe folder name!`}})
        }
        const updatedInfo = { folder_name }
        FoldersService.updateFolder(knexInstance,folderId,updatedInfo)
            .then(response => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = foldersRouter