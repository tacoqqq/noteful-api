const FoldersService = {
    getAllFolders(knex){
        return knex.select('*').from('folders')
    },

    createFolder(knex,folderInfo){
        return knex('folders')
            .insert(folderInfo)
            .returning('*')
            .then(newFolderRow => {
                return newFolderRow[0]
            })
    },

    getFolderById(knex,id){
        return knex('folders')
            .select('*')
            .where('id', id)
            .first()
    },


    deleteFolder(knex,id){
        return knex('folders')
            .where('id',id)
            .delete()
    },

    updateFolder(knex,id,updatedFields){
        return knex('folders')
            .where('id',id)
            .update('folder_name', updatedFields.folder_name)
    }

}

module.exports = FoldersService