define(function (require, exports, module) {
    var db;
    var app_name = 'app';

    function initDb(fn) {
        db = window.openDatabase(app_name, "1.0", app_name + " store database", 1024 * 10);
        var tables = [{
            name: "HashMapDisc",
            columns: ["key TEXT PRIMARY KEY", "value TEXT"]
        }];

        db.transaction(function (tx) {
            for (var index = 0; index < tables.length; index++) {
                var table = tables[index];
                tx.executeSql("CREATE TABLE IF NOT EXISTS " + table.name + "(" +
                    table.columns.join(", ") + ");");
            }
        }, function (err) {
            console.error("Error processing SQL: " + err.code);
        }, fn);
    }

    function put(key, value, onSuccess) {
        console.log('put');
        deleteObj(key, function () {
            db.transaction(function (tx) {
                tx.executeSql("INSERT INTO HashMapDisc (key,value) VALUES (:name,:value);", [key, value],
                    function (tx, results) {
                        onSuccess();
                    });
            }, function (error) {
                console.error(error.message);
            });
        });
    }

    function get(key, onSuccess) {
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM HashMapDisc where key = :key", [key], function (tx, results) {
                if (results && results.rows.length > 0) {
                    var row = results.rows.item(0);
                    onSuccess(row);
                } else {
                    onSuccess(null);
                }
            });
        }, function (error) {
            console.error(error.message);
        });
    }

    function deleteObj(key, onSuccess) {
        db.transaction(function (tx) {
            tx.executeSql("delete from  HashMapDisc where key = :key;", [key],
                function (tx, results) {
                    onSuccess();
                });
        });
    }

    return {
        put: put,
        get: get,
        deleteObj: deleteObj,
        initDb: initDb
    }
});
