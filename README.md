# sMocker
smocker is a simple javascript framework that aims to help you testing or prototyping javascript based (single-page) web applications with many **ajax**  operations.

## At a glance
To have a taste of what smocker can do you can quickly get started by including in your html something like this:

```html
<script type="text/javascript" src="smocker.js"></script>
<script type="text/javascript">
  smocker.play(function() {
    this.get('/todos').respondWith({
  	  status: 200,
  	  content: [
  	    {id: 1, title: 'something to do', completed: false},
	    {id: 2, title: 'something done', completed: true}
  	  ]
    });
  });
</script>
```

