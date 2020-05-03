const NotesService = {
    getAllNotes(knex){
        return knex.select('*').from('notes')
    },

    createNote(knex, newNoteInfo){
        return knex('notes')
            .insert(newNoteInfo)
            .returning('*')
            .then(newAddedRow => {
                return newAddedRow[0]
            })
    },

    getNoteById(knex, noteId){
        return knex('notes')
            .select('*')
            .where('id', noteId)
            .first()
    },

    deleteById(knex, noteId){
        return knex('notes')
            .where('id', noteId)
            .delete()
    },

    updateById(knex, noteId, updatedInfo){
        return knex('notes')
            .where('id', noteId)
            .update(updatedInfo)
    }

}

module.exports = NotesService