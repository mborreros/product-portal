ActiveRecord::Schema[7.0].define(version: 2023_02_21_183002) do
  create_table "products", force: :cascade do |t|
    t.string "name"
    t.string "lot_number"
    t.integer "weight"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "complete", default: false
  end

  create_table "products_shelves", force: :cascade do |t|
    t.integer "product_id"
    t.integer "shelf_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "shelves", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
