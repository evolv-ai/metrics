# Metrics
The Metrics integration allows metrics (audience attributes and events) to be populated/emitted from dom, query parameters, datalayer, cookie, local storage,  session storage, and more.

## Why
The goal of the Metrics integration is to provide a central location where both audience attributes and events can be defined declaritively in a robust way that can be used to specify full funnel progression metrics across experiments.

## Setup in the Evolv Manager
[Adding an integration to the Evolv Manager](https://support.evolv.ai/hc/en-us/articles/4403940021651-Creating-a-custom-integration#h_01GCQN2MKAQEJXK0ANF71BWJGY)

## Configuration Concepts
The configuration json supports the creation of metrics through a hierarchical structure that provides both inheritance and filtering/conditions.

### [Inheritance](https://github.com/evolv-ai/metrics/wiki/Inheritance)
Inheritance is the idea of passing down common information (defined as attributes) to decendents of the current metric. The decendents can override the inherited attributes (and this is needed if you want to use Conditions). The mechanism of a metric passing inherited values is through the use of the `apply` attribute. When `apply` is present, the current metric is classified as an Abstract Metric.

### [Conditions](https://github.com/evolv-ai/metrics/wiki/Attribute:-when)
If a metric and all of its decendents should only be applied when a condition is met, you can use the `when` attribute to conditionally filter whether the children should be evaluated.

## Configuration Organization
The intent of the configuration json is to capture all metrics that will be captured as audience values or events. Each of these is referenced as a metric.

### Metrics
Each metric can contain the following [attributes](https://github.com/evolv-ai/metrics/wiki/Attributes):

* [when](https://github.com/evolv-ai/metrics/wiki/Attribute:-when) - is used to specify that the metric (or sub-metrics) have to meet the condition before they are to be applied
* [tag](https://github.com/evolv-ai/metrics/wiki/Attribute:-tag) - specifies what the metric will be reported as (event id for action `event` and audience attribute for action `bind`)
* [source](https://github.com/evolv-ai/metrics/wiki/Attribute:-source) - specifies where to get the audience attribute or event critera
* [key](https://github.com/evolv-ai/metrics/wiki/Attribute:-key) - specifies where to get the value in the source
* [action](https://github.com/evolv-ai/metrics/wiki/Atribute:-action) - is either `event` or `bind`  (`bind` is used if `action` is not specified)
* [type](https://github.com/evolv-ai/metrics/wiki/Attribute:-type) - is used when action is `bind` to convert the type to
* [apply](https://github.com/evolv-ai/metrics/wiki/Attribute:-apply) - indicates that the current metric is abstract and its content should be passed to the metrics in the `apply` array
* [value](https://github.com/evolv-ai/metrics/wiki/Attribute:-value) - Specifies an explicit value when using action `bind`
* [storage](https://github.com/evolv-ai/metrics/wiki/Attribute:-storage) - specifies that the value of a `bind` action should be cached for reference on downline pages
* [map](https://github.com/evolv-ai/metrics/wiki/Attribute:-map) - specifies value options when the value extracted needs further mapping
* [default](https://github.com/evolv-ai/metrics/wiki/Attribute:-default) - specifies the value to bind to a metric when it is unable to find the value indicated by `key`
* [poll](https://github.com/evolv-ai/metrics/wiki/Attribute:-poll) - allows the system to wait for some period of time and continue trying to extract a value
* [extract](https://github.com/evolv-ai/metrics/wiki/Attribute:-extract) - provides mechanism to extract out values from an object or element
* [combination](https://github.com/evolv-ai/metrics/wiki/Attribute:-combination) - allows two numeric values to be used in calculation of value

### Abstract Metrics
If a metric has an `apply` attribute, then it is an abstract metric and its attributes are only to provide interited values to the metrics in its `apply` section. An abstract metric is never applied to the page directly. However, if its children override the source and key, the parent's source and key must be validated/available before the children are evaluated.

### SPA
All metrics will be refreshed and reapplied when a `history.pushstate` is invoked if it is indicated in the Evolv snippet.


## More Information

- [Wiki](https://github.com/evolv-ai/metrics/wiki)

- [Cookbook Examples](https://github.com/evolv-ai/metrics/wiki/Cookbook-Examples)
