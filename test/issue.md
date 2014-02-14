The following test does not fail.  It does not fail silently when the promise library is `when`

```
it("should fail", function () {
  fulfilledPromise([]).should.eventually.be.an.instanceOf(String);
});
```

If the promise library is `q` the following `Unhandled rejection` is seen:

    [Q] Unhandled rejection reasons (should be empty): AssertionError: expected [] to be an instance of String


I've been seeing this error in phantomjs while testing, for my `after all` hook that deleted the test database after testing was done:
    
    1) Library Interface: mapper tests: "after all" hook:
         Error: SECURITY_ERR: DOM Exception 18


After some research, I've found that the WebSql [Spec](http://www.w3.org/TR/webdatabase/) states:

    >4.1 Databases

    >Each origin has an associated set of databases. Each database has a name and a current version. <b>There is no way to enumerate or delete the databases</b> available for an origin from this API.

However, [this guy on SO](http://stackoverflow.com/a/18377488/149060) says:
    
    >In [my library](http://dev.yathit.com/api-reference/ydn-db/ydn-db.html) implementation, I just delete all tables. Which, indeed, delete the database. List of tables are `select * from sqlite_master`.


For ease of reference, I've copied out his code for WebSql.deleteDatabase:
    
    /**
     *
     * @param {string} db_name database name to be deleted.
     * @param {string=} opt_type delete only specific types.
     */
    ydn.db.con.WebSql.deleteDatabase = function(db_name, opt_type) {
      if (!!opt_type && opt_type != ydn.db.base.Mechanisms.WEBSQL) {
        return;
      }
      // WebSQL API does not expose deleting database.
      // Dropping all tables indeed delete the database.
      var db = new ydn.db.con.WebSql();
      var schema = new ydn.db.schema.EditableDatabase();
      db.logger.finer('deleting websql database: ' + db_name);
      var df = db.connect(db_name, schema);

      var on_completed = function(t, e) {
        db.logger.info('all tables in ' + db_name + ' deleted.');
      };

      df.addCallback(function() {

        db.doTransaction(function delete_tables(tx) {

          /**
           * @param {SQLTransaction} transaction transaction.
           * @param {SQLResultSet} results results.
           */
          var success_callback = function(transaction, results) {
            if (!results || !results.rows) {
              return;
            }
            var n = results.rows.length;
            var del = 0;
            for (var i = 0; i < n; i++) {
              var info = /** @type {SqliteTableInfo} */ (results.rows.item(i));
              if (info.name == '__WebKitDatabaseInfoTable__' ||
                  info.name == 'sqlite_sequence') {
                continue;
              }
              del++;
              db.logger.finest('deleting table: ' + info.name);
              tx.executeSql('DROP TABLE ' + info.name);
            }
            db.logger.finer(del + ' tables deleted from "' + db_name + '"');
          };

          /**
           * @param {SQLTransaction} tr transaction.
           * @param {SQLError} error error.
           */
          var error_callback = function(tr, error) {
            if (ydn.db.con.WebSql.DEBUG) {
              window.console.log([tr, error]);
            }
            throw error;
          };

          var sql = 'SELECT * FROM sqlite_master WHERE type = "table"';

          tx.executeSql(sql, [], success_callback, error_callback);

        }, [], ydn.db.base.TransactionMode.READ_WRITE, on_completed);

      });
      df.addErrback(function() {
        db.logger.warning('Connecting ' + db_name + ' failed.');
      });
    };
    ydn.db.databaseDeletors.push(ydn.db.con.WebSql.deleteDatabase);
