Shadow Annotations / Reactive Annotations
Shadows Annotations is javascript library for AngularJS, Angular2.
After many years developing enterprise applications I realized that we do something wrong and it was beginning of Shadow Annotations/Reactive Annotations.
The idea behind SA/RA is very simple. It is based on reactive model and what is reactive model?
Frankly, it is model that knows how to react when his attribute is changed. 
Let image person model. Every person has first and last name.
```
{ 
      firstName: null, 
      lastName: null,
}
```

When you are creating UI for this model, input text fields will require not empty value for first name and also last name attribute. But out example model doesn’t know anything about this requirements. 
Smart reactive model may looks like this.
```
{ 
      @RequiredValidation
      firstName: null, 

      @RequiredValidation
      lastName: null,
}
```

But if you are familiar with JSON and Javascript, you know that above example is wrong. There is not support for annotations.
But we can annotate model like this.
```
{ 
      sa$firstName: { requiredValidation: {}}
      firstName: null, 

      sa$lastName: { requiredValidation: {}}
      lastName: null,
}
```
Or just create “shadow” object that holds only annotations. (It is better when you are using REST).
```
{ 
      sa$firstName: { requiredValidation: {}}
      sa$lastName: { requiredValidation: {}}
}
```
Now we can link our model with shadow model and the magic with SA can happens. 
ShadowAnnotations.link('model', this.model, this.shadowModel, true);
ShadowAnnotations.enable();

Every time the value of first or last name is changed, model reacts and validates himself and validation errors are propagated.

```
[
    {"property":"lastName","errorKey":"error.validation.required","objectKey":"model"},
    {"property":"firstName","errorKey":"error.validation.required","objectKey":"model"}
]
```


This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.15.1.

## Build & development

Run `grunt` for building and `grunt serve` for preview.

## Testing

Running `grunt test` will run the unit tests with karma.
"# sa" 
