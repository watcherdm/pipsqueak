var pip = new PipSqueak({})


pip.get('/person').then(person => {
  $("body").html(`
    <h2>Name:</h2><h2 data-pii="name">${person.name}</h2>
    <h2>Phone:</h2><h2 data-pii="phone"">${person.phone}</h2>
    <div>Address</div><div data-pii="address">${person.address.street} ${person.address.city}, ${person.address.state} ${person.address.zip}</div>
  `)
  $("body").on('click', '[data-pii]', function(event){
    const prop = $(event.target).data('pii')
    if (person[prop].squeak) {
      person[prop].squeak().then(() => {
        $(event.target).attr("data-pii", null)
        $(event.target).text(person[prop])
      })
    } else {
      Promise.all(Object.keys(person[prop]).map(key => {
        const value = person[prop][key]
        return value.squeak();
      })).then(([...values]) => {
        const address = values.join(' ')
        $(event.target).attr("data-pii", null)
        $(event.target).text(address)
      })
    }
  })
})