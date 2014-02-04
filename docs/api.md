<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">
<html>
    <head>
        <title></title>
    </head>
    <body>
        <p>
            # Persistance &amp; Query API The library exposes a simple persistence API.
        </p>
        <table>
            <thead>
                <tr>
                    <th>
                        Operation
                    </th>
                    <th>
                        Description
                    </th>
                    <th>
                        Example
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div>
                            Create Polyhedron Data Store
                        </div>
                    </td>
                    <td></td>
                    <td>
                        <pre>
                            <code>var dataStore = new polyhedron({dbname: 'test'});</code>
                        </pre>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div>
                            Register Type with Polyhedron
                        </div>
                    </td>
                    <td></td>
                    <td>
                        <pre>
                            <code>var item = dataStore.type('item', fn)</code>
                        </pre>
                    </td>
                </tr>
                <tr>
                    <td>Create new unsaved object</td>
                    <td></td>
                    <td>
                        <pre>
                            <code>item.new().then(errFn, successFn)</code>
                        </pre>
                    </td>
                </tr>
                <tr>
                    <td>Create new saved object.</td>
                    <td></td>
                    <td>
                        <pre>
                            <code>item.create().then(errFn, successFn)</code>
                        </pre>
                    </td>
                </tr>
                <tr>
                    <td>Update or Save object to data store</td>
                    <td></td>
                    <td>
                        <pre>
                            <code>item.save().then(errFn, successFn)</code>
                        </pre>
                    </td>
                </tr>
                <tr>
                    <td>Delete given object from the data store.</td>
                    <td></td>
                    <td>
                        <pre>
                            <code>item.find</code>
                        </pre>
                    </td>
                </tr>
                <tr>
                    <td>Delete objects matching criteria</td>
                    <td></td>
                    <td>
                        <pre>
                            <code>item.findWhere</code>
                        </pre>
                    </td>
                </tr>
                <tr>
                    <td>Delete matching objects from the data store.</td>
                    <td></td>
                    <td>
                        <pre>
                            <code>item.deleteWhere</code>
                        </pre>
                    </td>
                </tr>
                <tr>
                    <td></td>
                    <td>Delete given object from the data store.</td>
                    <td>
                        <pre>
                            <code>item.delete</code>
                        </pre>
                    </td>
                </tr>
                <tr>
                    <td>exists?, isSaved?, isDirty?, dataStore commands (create, drop database, etc.)</td>
                    <td></td>
                    <td>
                        <pre>
                            <code></code>
                        </pre>
                    </td>
                </tr>
            </tbody>
        </table>
    </body>
</html>
