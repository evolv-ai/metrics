# Metrics
The Metrics integration allows metrics (audience attributes and events) to be populated/emitted from dom, query parameters, datalayer, cookie, local storage,  session storage, and more.

## Why
The goal of the Metrics integration is to provide a central location where both audience attributes and events can be defined declaritively in a robust way that can be used to specify full funnel progression metrics across experiments.

## Setup in the Evolv Manager
[Adding an integration to the Evolv Manager](https://support.evolv.ai/hc/en-us/articles/4403940021651-Creating-a-custom-integration#h_01GCQN2MKAQEJXK0ANF71BWJGY)

## Configuration Concepts
The Metrics integration will allow you to define how events are fired and how values are assigned to audience attributes within Evolv. To select whether a metric is intended as an event or audience attribute, use the [Attribute: action](https://github.com/evolv-ai/metrics/wiki/Atribute:-action).

## Event
To define an event metric the [tag](https://github.com/evolv-ai/metrics/wiki/Attribute:-tag) is used to specify the key in the manger that the event will count towards. A simple example of an event would be:

```
{
  "action": "event",
  "tag": "page-load"
}
```

## Audience Attribute
To define an audience attribute metric the [tag](https://github.com/evolv-ai/metrics/wiki/Attribute:-tag) will be used to specify the audience filed (it is recommended that you structure your fields with '.' delimiters). In addition, you will need to specify a [source](https://github.com/evolv-ai/metrics/wiki/Attribute:-source) to let the integration know where to pull the value from as well as specifying a [key](https://github.com/evolv-ai/metrics/wiki/Attribute:-key) to indicate what specific source you want to get the value from. A simple example of a audience value would be:

```
{
  "action": "bind",
  "tag": "user.language",
  "source": "expression",
  "key": "window.navigator.language"
}
```



## Metric configuration Structure
The configuration json supports the creation of metrics through a hierarchical structure that serves multiple purposes. Each level in this hierarchy may either represent a value/availability of data or a mechanism to support inheritance.

### Hierarchical Structure Evaluation
The main mechanism for structuring metrics is through the [apply](https://github.com/evolv-ai/metrics/wiki/Attribute:-apply) attribute. Each object inside the apply array represent children of the current metric. If any level has a `source`, and `key`, the children will not be evaluated until the `key` is present within the `source`.

For example: If you wanted to generate an event if a specific page is loaded, you might do something like:

```
{
  "source": "expression",
  "key": "document.location.pathname",
  "apply": [
    {
       "when": "cart",
       ""
       "tag": "page.load.cart"
    }
  ]
}
```

Note the event is using a [when](https://github.com/evolv-ai/metrics/wiki/Attribute:-when) attribute to test the value discovered by the parent whose key is `"key": "document.location.pathname"`. This provides a powerful mechanism of chaining information and conditionals that must be satisfied for an event or audience attribute to be applied.


### [Inheritance](Inheritance)
Inheritance is the idea of passing down common information (defined as attributes) to descendants of the current metric. The descendants can override the inherited attributes (and this is needed if you want to use Conditions). The attributes that can be inherited are:

* [source](https://github.com/evolv-ai/metrics/wiki/Attribute:-source) - Specifies where to get the audience attribute or event criteria from.
* [key](https://github.com/evolv-ai/metrics/wiki/Attribute:-key)  - Specifies where to get the value in the source.
* [tag](https://github.com/evolv-ai/metrics/wiki/Attribute:-tag)  - Specifies what the metric will be reported as (event id for action `event` and audience attribute for action `bind`).
* [action](https://github.com/evolv-ai/metrics/wiki/Atribute:-action) - Is either `event` or `bind` (`bind` is used if `action` is not specified)
* [on](https://github.com/evolv-ai/metrics/wiki/Attribute:-on)  - Specifies that the metric should wait on an async event (typically used for DOM events). This is limited and will not be inherited for any child that contains a new `"key"`.
* [type](https://github.com/evolv-ai/metrics/wiki/Attribute:-type)  - Is used when action is `bind` to convert the type to.
* [poll](https://github.com/evolv-ai/metrics/wiki/Attribute:-poll) - Allows the system to wait for some period of time and coninue trying to extract a value.


### In place [Additianoal Attributes](Attributes)
The following attributes are not inherited, but instead used to evaluate before evaluating children:

* [when](https://github.com/evolv-ai/metrics/wiki/Attribute:-when) - is used to specify that the metric (or sub-metrics) have to meet the condition before they are to be applied
* [apply](https://github.com/evolv-ai/metrics/wiki/Attribute:-apply) - indicates that the current metric is abstract and its content should be passed to the metrics in the `apply` array

Note: The inherited attributes can be used in place as well.


### Final [Attributes](Attributes)
These attributes are to be used at the leaf level only:

* [value](https://github.com/evolv-ai/metrics/wiki/Attribute:-value) - Specifies an explicit value when using action `bind`
* [storage](https://github.com/evolv-ai/metrics/wiki/Attribute:-storage) - specifies that the value of a `bind` action should be cached for reference on downline pages
* [map](https://github.com/evolv-ai/metrics/wiki/Attribute:-map) - specifies value options when the value extracted needs further mapping
* [default](https://github.com/evolv-ai/metrics/wiki/Attribute:-default) - specifies the value to bind to a metric when it is unable to find the value indicated by `key`
* [extract](https://github.com/evolv-ai/metrics/wiki/Attribute:-extract) - provides mechanism to extract out values from an object or element
* [combination](https://github.com/evolv-ai/metrics/wiki/Attribute:-combination) - allows two numeric values to be used in calculation of value


## Helpful links on metric configurations
- [Wiki](https://github.com/evolv-ai/metrics/wiki)
- [Sources](https://github.com/evolv-ai/metrics/wiki/Attribute:-source)
- [Setting up Evolv event](Setup-event)
- [Setting up Evolv audience](Setup-audience)
- [Cookbook Examples](Cookbook-Examples)
- [Guidelines](Guidelines)
- [Integration vs Environment Configuration](Integration-vs-Environment-Configurations)
- [Macros](Macros)
- [Diagnosing](Diagnosing)
- [Releases Notes](Release-Notes)
