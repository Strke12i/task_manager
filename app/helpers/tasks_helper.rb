module TasksHelper
  def date_compare(date)
    x = date - Date.today
    if x < 0
      "text-black"
    elsif x == 0
      "text-red-500"
    elsif x == 1
      "text-yellow-500"
    else
      "text-green-500"
    end
  end
end
