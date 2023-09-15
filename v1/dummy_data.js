function serviceCategories() {
  return [
    'My IT Assets',
    'View Raised Requests',
    'General IT Help',
    'HR Services',
    'Request New Software',
    'Request Laptops',
    'Request Mobile Devices',
    'Software Access'
  ].map(text => ({ text, link: '#' }));
}

export { serviceCategories };