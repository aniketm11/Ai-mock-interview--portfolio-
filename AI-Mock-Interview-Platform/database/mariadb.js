import mariadb from 'mariadb'; import env from '../config/env.js';
export default mariadb.createPool({host:env.MARIADB_HOST,port:env.MARIADB_PORT,user:env.MARIADB_USER,password:env.MARIADB_PASSWORD,database:env.MARIADB_DATABASE,connectionLimit:10,insertIdAsNumber:false});
