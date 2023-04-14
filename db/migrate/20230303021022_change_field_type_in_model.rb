class ChangeFieldTypeInModel < ActiveRecord::Migration[7.0]
  def change
    change_column :tasks, :description, :text
  end
end
