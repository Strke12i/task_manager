class Task < ApplicationRecord
  belongs_to :user
  has_rich_text :description
  has_and_belongs_to_many :assigned_users, class_name: 'User'
  has_many_attached :attachments

  validates :due_date, presence: true

  validate :attachments_types
  validate :attachments_size

  private

  def attachments_types
    attachments.each do |attachment|
      if !attachment.content_type.in?(%w[application/pdf text/plain application/vnd.openxmlformats-officedocument.wordprocessingml.document image/png image/jpeg])
        errors.add(:attachments, 'Must be PDF, TXT, Word, JPEG ou PNG')
      end
    end
  end

  def attachments_size
    attachments.each do |attachment|
      if attachment.byte_size > 10.megabytes
        errors.add(:attachments, 'Must be no more than 10 MB')
      end
    end
  end
end
