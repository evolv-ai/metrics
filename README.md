# Metrics
The Metrics integration allows metrics (audience attributes and events) to be populated/emitted from dom, query parameters, datalayer, cookie, local storage, and session storage.

## Why
The goal of the Metrics integration is to support a robust set of metrics that can be used to specify full funnel progression across experiments.

## Setup in the Evolv Manager
[Adding an integration to the Evolv Manager](https://github.com/evolv-ai/env-integrations/blob/main/README.md)

## Config concepts
The config supports the creation of metrics through inheritance and conditions.

### Inheritance
Inheritance is the idea of passing down common information (defined as attributes) to decendents of the current metric. The decendents can override the inerited attributes (and this is needed if you want to use Conditions). The mechanism of a metric passing inherited values is through the use of the `apply` attribute. When `apply` is present, the current metric is classified as an Abstract Metric.

### Conditions
If a metric and all of its decendents should only be applied when a condition is met, you can use the `when` attribute.
If the value is a `string`, it will be treated as a regex that will need to match the parent metric before the current metric and it's decendents are applied.
If the value is an `object`, it must contain an `operator` and a `value` that will be used to validate that the parent metric satisfies before the current metric and its scendents are applied. The options for `operator` current are for numeric and can be one of `"<"`, `">"`, `"<="`, or `">="`.

## The config organization
The intent of the configuration json is to capture all metrics that will be captured as audience values or events. Each of these is referenced as a metric. 

### Metrics
Each metric can contain the following attributes:

* when - is used to specify that the metric (or sub-metrics) have to meet the condition before they are to be applied
* tag - specifies what the metric will be reported as (event id for action `event` and audience attribute for action `bind`)
* source - specifies where to get the audience attribute or event critera
* key - specifies where to get the value in the source 
* action - is either `event` or `bind`  (`bind` is used if `action` is not specified)
* type - is used when action is `bind` to convert the type to
* apply - indicates that the current metric is abstract and its content should be passed to the metrics in the `apply` array
* value - Specifies an explicit value when using action `bind`
* storage - specifies that the value of a `bind` action should be cached for reference on downline pages
* map - specifies value options the value extracted needs further mapping
* default - specifies the value to bind to a metric when it is unable to find the value indicated by `key`
* poll - allows the system to wait for some period of time and coninue trying to extract a value

### Abstract Metrics
If a metric has an `apply` attribute, then it is an abstract metric and it's attributes are only to provide interited values to the metrics in it's `apply` section. An abstract metric is never applied to the page directly.


### Top level Defaults
Since the apply key will be at the top level, the top level should be thought as an abstract metric. It contains the following attributes that can be overriden at the default or inherited metrics

```
"source": "expression",
"key": "window.location.pathname",

```


### SPA
All metrics will be refreshed and reapplied when a `history.pushstate` is invoked if it is indicated in the Evolv snippet.


## Metric attributes
The main requirements for concrete metrics, are objects that contain contain `tag`, `source` and `key`. 

### when
The `when` attribute contains a regular expression as a string and the parent metric's value must pass the regular expression before the current metric or any of its decendents are applied.

### action
There are two values that are valid for an `action` field. The default is `bind` and specifies that the goal of the metric is to bind a value to an attribute in the context. The alternative value for `action` is `event` that indicates that the metric is intended to be recorded as an event.

### tag
The `tag` attribute specifies the identifier of the metric (the same tag can be used multiple times in the config). For `event` actions, the tag is used as the event identifier. For `bind` actions, the tag is used as the audience attribute to bind a value to.

### source & key
The following is a table showing the different sources that can be associated with a metric:

| Source         | Key (usage)              | Description                                                                                            |
| ----------     | ------------------------ | ------------------------------------------------------------------------------------------------------ |
| query          | name of query parameter  | The value of the query parameter within the url          |
| expression     | js expression            | An expression                                            |
| cookie         | cookie name              | Return value of cookie                                   |
| localStorage   | localStorage key         | Return value of localStorage key                         |
| sessionStorage | sessionStorage key       | Return value of sessionStorage key                       |
| dom            | css selector             | Returns `found` if dom element exists on page            |
| jqdom          | jquery selector          | Returns `found` if dom element exists on page            |
| extension      | name of extension        | Currenty only one extension `distribution`: tracks a random value between 0-100 that persists for user |


### type
If a `type` attribute is specified, its value represents the type of the value of the attribute. By default, the type is assumed to be string. The following are the types available:
* boolean
* float - depricated (use number)
* int - depricated (use number)
* number
* string
* array

### apply
The `apply` attribute is the mechanism to specify all decendent metrics that will inherit the current Abstract metric's attributes.

### map
The `map` is represented as an array of objects that allows the value of the attribute to be transformed. Those mappings each have 2 json keys:
* when - a regex for testing the attribute value against
* value - the new value to be bound to the attribute when conditional is met

### on
The `on` attribute provides a way of listening to a specific `dom` events before processing the metric. This currently supports listening to dom elements. If the `source` is `dom` and there is no event to listen to, then the metric will apply as soon as the element is available in the dom. 

In addition to the standard dom element events, there is also a special `iframe:focus` event to observe iframe engagement.

### extract
The `extract` attribute provides a way of extracting values from the metric. This currently supports extracting values from dom elements. Current attributes include `attribute` (for the dom element attribute to extract) and `parse` (a regexp that will be used to cull the attribute for the desired conversion).

### storage
The `storage` is an object indicating that the value should be cached with the following options:
* key - a required key that indicates the key to store and retrieve from storage (The integration will prefix this key with `evolv:` )
* type - `(local|session)` indicating localStorage or sessionStorage (defaults to `session`)
* resolveWith - What to resolve with when there are both a value and a cached value. Options are: 
    * `(new|cached)` for type of string
    * `(new|cached|sum|min|max)` for type of number
    * `(new|cached|union)` for type of array

### poll
If a value is not imediately available when the integration is processed, a poll can be specified to periodically reevaluate the attribute until it is detected or poll duration expires.

### default
This allows a value to be specified that will be added to the context imediately if the attribute is not available yet. It will be overriden if the `poll` is set and the value becomes available.

[Wiki](https://github.com/evolv-ai/metrics/wiki)


[Cookbook Examples](https://github.com/evolv-ai/metrics/wiki/Cookbook-Examples)




