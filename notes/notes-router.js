const express = require('express')
const path = require('path')
const xss = require('xss')
const NotesService = require('./notes-service')
const notesRouter = express.Router()
const parseBody = express.json()


function sanitizedContent(content)  {
    return {
        id: content.id,
        title: xss(content.title),
        content: xss(content.content),
        created_time: content.created_time,
        folder_id: content.folder_id
    }
}

notesRouter
    .route('/')
    .get((req,res,next) => {
        const knexInstance = req.app.get('db')
        NotesService.getAllNotes(knexInstance)
            .then(notes => {
                res.status(200).json(notes.map(note => sanitizedContent(note)))
            })
            .catch(next)
    })
    .post(parseBody, (req,res,next) => {
        const knexInstance = req.app.get('db')
        const { title,content,folder_id } = req.body
        const newNote = { title, folder_id }
        for (const [key,value] in Object.entries(newNote)){
            if (value === null){
                return res.status(400).json({error: {message:`Bad request! Missing ${key} information.`}})
            }
        }
        newNote.content = content
        console.log('trigerring function')
        NotesService.createNote(knexInstance,newNote)
            .then(addedNote => {
                res.status(201)
                    .location(path.posix.join(req.originalUrl, `/${addedNote.id}`))
                    .json(addedNote)
            })
            .catch(next)
    })

notesRouter
    .route('/:noteId')
    .all((req,res,next) => {
        const knexInstance = req.app.get('db')
        const { noteId } = req.params
        NotesService.getNoteById(knexInstance, noteId)
            .then(note => {
                if (!note){
                    return res.status(404).json({error:{message: `Bad request: no note found!`}})
                }
                res.note = note
                next()
            })
            .catch(next)
    })
    .get((req,res) => {
        res.json(sanitizedContent(res.note))
    })
    .delete((req,res,next) => {
      const knexInstance = req.app.get('db')
      const { noteId } = req.params
      NotesService.deleteById(knexInstance, noteId)
        .then(response => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(parseBody, (req,res,next) => {
        const knexInstance = req.app.get('db')
        const { noteId } = req.params
        const {title, content, folder_id} = req.body
        const updatedFields = { title , content , folder_id}
        const numberOfValues = Object.values(updatedFields).filter(Boolean).length
        if (numberOfValues === 0){
            return res
            .status(400).json({error: {message:`Bad request! Request body must conatain either 'title', 'content' or 'folder_id'`}})
        }
        NotesService.updateById(knexInstance , noteId , updatedFields)
            .then(response => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = notesRouter