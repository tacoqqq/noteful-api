create table folders (
    id integer primary key generated by default as identity,
    folder_name text not null,
    created_time timestamptz default now() not null
);