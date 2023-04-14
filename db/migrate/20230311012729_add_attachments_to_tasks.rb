class AddAttachmentsToTasks < ActiveRecord::Migration[7.0]
  def change
    add_column :tasks, :attachments, :json
  end
end
