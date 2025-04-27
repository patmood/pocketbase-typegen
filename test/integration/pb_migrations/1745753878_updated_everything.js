/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4226991559")

  // add field
  collection.fields.addAt(17, new Field({
    "hidden": false,
    "id": "geoPoint3807818301",
    "name": "geopoint_field",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "geoPoint"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4226991559")

  // remove field
  collection.fields.removeById("geoPoint3807818301")

  return app.save(collection)
})
