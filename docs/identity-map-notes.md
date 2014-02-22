## Identity Map Notes

#### Identity and Object Metadata
- non-enumerable property `__PLH__` will contain object metadata and metadata related functions
- objects will have a local, identity map unique, identifier
- objects will have registered type that defines a type-wide globally unique key
- object metadata includes: 
  - identity map id: `__PLH__.id` 
  - identity map type: `__PLH__.type`  
  - list of databases to which it is persisted: : `__PLH__.databases()`  
  - isDirty indicator, relative to each participating database (serialize 'clean' object per database, plus current version -- `isDirty = !(current === database[clean])`: : `__PLH__.isDirty()` and `__PLH__.isDirty(database)` which returns overall state and per database state.  Overall state is false if each individual database `isDirty` check is false.
  - Promise results, per database, of recent, incomplete (pending or failed), operations.  Failing promise results contain replay information for retry

#### Databases and Types
- identity map has list of registered types
- identity map has list of databases
- databases have list of types they persist
- types have list of databases to which they are persisted 
- databases are identified by serverAPI+db_id
- datastores are identified by type+database
- types and databases have a many to many relationship
- a datastore is a specific database+type combination
- **TODO:** support `scope` on datastore, i.e. require [user_id = user] on all operations

#### Observable Support
- items in the identity map implement the 'observable' pattern
- consumers ($scope controllers) can register identity map change handlers on individual items
- consumers can register change handlers on identity map type-item members
- reference library: https://github.com/Polymer/observe-js

#### Operation Propagation (& Offline Support)
- objects in identity map have prototype method that returns list of databases that store that item
- Mapper operations hit the identity map first, and then propagate to each participating database (each database operation returning a promise) and 
- operations return a single promise or an array of promises, depending on whether the operation is blocking or not.
- promise results, per database+operation, of recent operations are retained until all succeed
- operation details, for each incomplete operation, are retained for offline to online sync
- retry semantics for offline to online are configurable
- operations must have timeout property to prevent promise remaining forever pending
- reference implementation of action queue: https://github.com/orbitjs/orbit.js/blob/master/lib/orbit/action_queue.js

#### Use cases (scenarios for testing):

    Example One
    - identity map
    - local pouchdb
    - remote couchdb
    - replication and changes feed

    Example Two
    - identity map
    - local pouchdb
    - remote REST API

    Example Three
    - identity map
    - dropbox datastore Api
    - remote couchdb

#### Reference Implementations
- SyncIt: https://github.com/forbesmyester/SyncIt
- https://github.com/orbitjs/orbit.js/ "Orbit.js: A standalone library for data access and synchronization"
- https://github.com/HubSpot/offline "The requests module holds any failed AJAX requests and, after deduping them, remakes them when the connection is restored."
- http://blog.shinetech.com/2012/12/24/an-identity-map-for-backbone-js/ (no sync support included - the most basic of maps as a cache)