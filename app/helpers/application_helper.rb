module ApplicationHelper
  def input_class(options={})
    "w-full border border-gray-300 text-black rounded-lg py-2 pl-8 pr-3 transition-all duration-300 ease-in-out focus:outline-none focus:shadow-outline focus:border-blue-500 #{options[:extended_classes]}"
  end

  def central_text(options={})
    "text-center pb-5 font-extrabold text-3xl #{options[:extended_classes]}"
  end
  def label_class(options={})
    "block mb-1 font-normal leading-normal #{options[:extended_classes]}"
  end
  def button_class(options={})
    "bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 #{options[:extended_classes]}"
  end
end
