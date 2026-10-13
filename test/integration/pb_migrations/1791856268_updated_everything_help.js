/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4226991559")

  // update field
  collection.fields.add(new Field({
    "help": "Any number, positive or negative",
    "hidden": false,
    "id": "number3770467984",
    "max": null,
    "min": null,
    "name": "number_field",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.add(new Field({
    "help": "Whether the record is enabled.\nDefaults to false.",
    "hidden": false,
    "id": "bool2425384623",
    "name": "bool_field",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4226991559")

  // update field
  collection.fields.add(new Field({
    "hidden": false,
    "id": "number3770467984",
    "max": null,
    "min": null,
    "name": "number_field",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.add(new Field({
    "hidden": false,
    "id": "bool2425384623",
    "name": "bool_field",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
})
