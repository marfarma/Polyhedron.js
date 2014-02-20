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
<code>Users.new()</code>
                </pre>
                <p>Creates a new unsaved instance of the registered object by calling the registered function with 'new'.  Executes validations and create event callbacks, if defined on the registered object.  Returns a promise that resolves to the new item.</p>
                <pre>
<code>Users.new({name:"Jane Doe",handle:"supercool",email:"jdoe@example.com"})</code>
                </pre>
                <p>Creates a new unsaved instance of the registered object via Object.create() and copies the given properties into it. Executes validations and create event callbacks, if defined on the registered object.  Returns a promise that resolves to the new item.</p>
                <pre>
<code>Users.new([item1,item2])</code>
                </pre>
                <p>Creates a new unsaved instance of the registered object via Object.create() and copies the given properties into it for each item in the array. Executes validations and create event callbacks, if defined on the registered object.  Returns an array of promises that each resolve to the new item.  Each operation in the array succeeds or fails independently of any other.</p>
            </td>
        </tr>
        <tr>
            <td>
                <div>
                    Create a new saved object.
                </div>
            </td>
            <td>
                <pre>
<code>Users.create()</code>
                </pre>
                <p>Creates a new saved instance of the registered object by calling the registered function with 'new'.  Executes validations and create and save event callbacks, if defined on the registered object.    Returns a promise that resolves to the new item.</p>
                <pre>
<code>Users.create({name:"Jane Doe",handle:"supercool",email:"jdoe@example.com"})</code>
                </pre>
                <p>Creates a new unsaved instance of the registered object via Object.create() and copies the given properties into it. Executes validations and create and save event callbacks, if defined on the registered object.  Returns a promise that resolves to the new item.</p>
                <pre>
<code>Users.create([item1,item2])</code>
                </pre>
                <p>Inserts or updates each item in the given array to the data store. Executes validations and save event callbacks, if defined on the registered object.  Returns an array of promises that each resolve to the new item.  Each operation in the array succeeds or fails independently.</p>
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
<code>Users.save(item)</code>
                </pre>
                <p>Inserts or updates given item to the data store. Executes validations and save event callbacks, if defined on the registered object.  Returns a promise that resolves to the saved object.</p>
                <pre>
<code>Users.save([item1,item2])</code>
                </pre>
                <p>Inserts or updates each item in the given array to the data store. Executes validations and save event callbacks, if defined on the registered object.  Returns an array of promises that resolves to the saved object.  Each operation in the array succeeds or fails independently.</p>
            </td>
        </tr>
        <tr>
            <td><div>Find given object from the data store.</div></td>
            <td>
                <pre>
<code>Users.find()</code>
                </pre>
                <p>Returns a promise that resolves to an array containing all saved items of the registered type.</p>
                <pre>
<code>Users.find({name:"Jane Doe"})</code>
                </pre>
                <p>Returns a promise that resolves to an array containing all saved items of the registered type with properties matching the given object.</p>
                <pre>
                <pre>
<code>Users.find([{name:"Jane Doe"},{name:"John Smith"}])</code>
                </pre>
                <p>Returns a promise that resolves to an array containing all saved items of the registered type with properties matching the given objects. Returns a distinct union of all matching items, i.e. match conditions are combined with an 'OR' constraint.</p>
                <pre>
<code>Users.findWhere("age > 30 and gender = 'male'")</code>
                </pre>
                <p>Returns a promise that resolves to an array containing all saved items of the registered type matching the given criteria</p>
            </td>
        </tr>
        <tr>
            <td><div>Delete objects from the data store.</div></td>
            <td>
                <pre>
<code>Users.delete()</code>
                </pre>
                <p>Deletes all saved items of the registered type.  Executes delete event callbacks, if defined on the registered object.  Returns a promise that resolves to the count of deleted items.</p>
                <pre>
<code>Users.delete({name:"Jane Doe"})</code>
                </pre>
                <p>Deletes all saved items of the registered type with properties matching the given object.  Executes delete event callbacks, if defined on the registered object.  Returns a promise that resolves to the count of deleted items.</p>
                <pre>
<code>Users.delete([{name:"Jane Doe"},{name:"John Smith"}])</code>
                </pre>
                <p>Deletes all saved items of the registered type with properties matching the given objects. Match conditions are combined with an 'OR' constraint, so items matching any of the supplied object's properties will be deleted.  Executes delete event callbacks, if defined on the registered object.  Returns an array of promises that each resolve to the count of deleted items.  Each operation in the array succeeds or fails independently.</p>
                <pre>
<code>Users.deleteWhere("age > 30 and gender = 'male'")</code>
                </pre>
                <p>Delete objects matching criteria.  Executes delete event callbacks, if defined on the registered object.  Returns a promise that resolves to the count of deleted items.</p>
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
