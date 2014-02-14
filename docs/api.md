# Persistance & Query API 

The library exposes a simple persistence API.

<table>
    <thead>
        <tr>
            <th>
                Operation
            </th>
            <th>
                Code Example
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
            <td>
                <pre>
<code>var db = new Polyhedron.Datastore(PouchDB, 'testDb');</code>
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                <div>
                    Delete Polyhedron Data Store
                </div>
            </td>
            <td>
                <pre>
<code>db.destroy();</code>
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                <div>
                    Register Type with Polyhedron
                </div>
            </td>
            <td>
                <pre>
<code>var Users = db.register('Users', UserModel);</code>
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                <div>
                    Deregister Type with Polyhedron
                </div>
            </td>
            <td>
                <pre>
<code>var Users = db.deregister('Users');</code>
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                <div>
                    List Registered Types
                </div>
            </td>
            <td>
                <pre>
<code>var Users = db.registered();</code>
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                <div>
                    Create new unsaved object
                </div>
            </td>
            <td>
                <pre>
<code>Users.new().then(errFn, successFn)</code>
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                <div>
                    Create new saved object.
                </div>
            </td>
            <td>
                <pre>
<code>Users.create().then(errFn, successFn)</code>
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                <div>
                    Update or Save object to data store
                </div>
            </td>
            <td>
                <pre>
<code>Users.save().then(errFn, successFn)</code>
                </pre>
            </td>
        </tr>
        <tr>
            <td><div>Delete given object from the data store.</div></td>
            <td>
                <pre>
<code>Users.find</code>
                </pre>
            </td>
        </tr>
        <tr>
            <td><div>Delete objects matching criteria</div></td>
            <td>
                <pre>
<code>Users.findWhere</code>
                </pre>
            </td>
        </tr>
        <tr>
            <td><div>Delete matching objects from the data store.</div></td>
            <td>
                <pre>
<code>Users.deleteWhere</code>
                </pre>
            </td>
        </tr>
        <tr>
            <td>Delete</td>
            <td>
                <pre>
<code>Users.delete</code>
                </pre>
                <p>Delete given object from the data store.</p>
            </td>
        </tr>
        <tr>
            <td><div>Misc</div></td>
            <td>
                <pre>
<code></code>
                </pre>
                <p>exists?, isSaved?, isDirty?, dataStore commands (create, drop database, etc.)</p>
            </td>
        </tr>
    </tbody>
</table>
