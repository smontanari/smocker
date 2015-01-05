describe('ResponseObject', function() {
  describe('Primitive types response', function() {
    _.each({
        'String': ['test content', 'test content'],
        'Boolean true': [true, 'true'],
        'Boolean false': [false, 'false'],
        'Number': [123, '123']
      }, function(values, type) {
      describe(type, function() {
        it('returns a response object with the given text content', function() {
          var responseObject = new smocker.ResponseObject(values[0]);

          expect(responseObject).toEqual(jasmine.objectContaining({
            status: 200,
            headers: {'Content-Type': 'text/plain;charset=utf-8'},
            denormalisedContent: values[0],
            content: values[1],
            delay: 0
          }));
        });
      });
    });
  });

  describe('Object type response', function() {
    _.each({
      'undefined content': [
        {},
        {
          status: 200,
          headers: {},
          denormalisedContent: undefined,
          content: undefined,
          delay: 0
        }
      ],
      'null content': [
        { headers: {'Accept-Language': 'en-US'}, content: null },
        {
          status: 200,
          headers: {'Accept-Language': 'en-US'},
          denormalisedContent: null,
          content: undefined,
          delay: 0
        }
      ],
      'empty content object': [
        {
          content: {}
        },
        {
          status: 200,
          headers: {'Content-Type': 'application/json;charset=utf-8'},
          denormalisedContent: {},
          content: '{}',
          delay: 0
        }
      ],
      'with content type': [
        {
          headers: {'Content-Type': 'text/html;charset=utf-8', 'Accept-Language': 'en-US'},
          content: '<p>test content</p>'
        },
        {
          status: 200,
          headers: {'Content-Type': 'text/html;charset=utf-8', 'Accept-Language': 'en-US'},
          denormalisedContent: '<p>test content</p>',
          content: '<p>test content</p>',
          delay: 0
        }
      ],
      'without content type and content as object': [
        {
          status: 201,
          headers: {'Accept-Language': 'en-US'},
          content: {id: 'test object'}
        },
        {
          status: 201,
          headers: {'Accept-Language': 'en-US', 'Content-Type': 'application/json;charset=utf-8'},
          denormalisedContent: {id: 'test object'},
          content: '{"id":"test object"}',
          delay: 0
        }
      ],
      'without content type and content as string': [
        {
          headers: {'Accept-Language': 'en-US'},
          content: 'test response',
          delay: 3
        },
        {
          status: 200,
          headers: {'Accept-Language': 'en-US', 'Content-Type': 'text/plain;charset=utf-8'},
          denormalisedContent: 'test response',
          content: 'test response',
          delay: 3
        }
      ],
      'without content type and content as number': [
        {
          status: 201,
          headers: {'Accept-Language': 'en-US'},
          content: 123,
          delay: 3
        },
        {
          status: 201,
          headers: {'Accept-Language': 'en-US', 'Content-Type': 'text/plain;charset=utf-8'},
          denormalisedContent: 123,
          content: '123',
          delay: 3
        }
      ],
      'without content type and content as boolean true': [
        {
          headers: {'Accept-Language': 'en-US'},
          content: true
        },
        {
          status: 200,
          headers: {'Accept-Language': 'en-US', 'Content-Type': 'text/plain;charset=utf-8'},
          denormalisedContent: true,
          content: 'true',
          delay: 0
        }
      ],
      'without content type and content as boolean false': [
        {
          headers: {'Accept-Language': 'en-US'},
          content: false
        },
        {
          status: 200,
          headers: {'Accept-Language': 'en-US', 'Content-Type': 'text/plain;charset=utf-8'},
          denormalisedContent: false,
          content: 'false',
          delay: 0
        }
      ]
    }, function(values, type) {
      describe(type, function() {
        it('returns the normalised response object', function() {
          var responseObject = new smocker.ResponseObject(values[0]);

          expect(responseObject).toEqual(jasmine.objectContaining(values[1]));
        });
      });
    });
  });
});