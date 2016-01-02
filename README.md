# README #

SPoker is social poker cardgame written in Meteor.

A reactive rendering full-stack universal javascript framework enpowers us.

### CORE Technology ###
* Meteor
It enables easy developing, deploying and hosting. I could deploy without any complicated environmental construction (such as npm, bower, yeoman ...) nor implementation of authentification, deta-mapping.

* MongoDB
RDBMS such as mysql, Postgresql are sometimes very useful, but it's not suitable for tree-like structure. In meteor, we don't have to call mongo API.

* AUI
It's very hard for me to reconstructure UI such as buttons, budges and dialogs. Some bootstraps help us to build a website. I choose AUI because AUI supports CDN and it has a lot of useful components.

* highchart.js
Interactive and compatible chart's visualizing tool enhances my webapp. To visualize big data supports our conprehension. Highcharts.js can build graph easily.

### Demo and Specification ###
[Click](http://sharppoker.meteor.com/)

Please see a help section at that page.

### How do I get set up? ###

* Summary of set up
Please get meteor (https://www.meteor.com/) and it needs mongodb in advance.

```bash
sudo pacman -S mongodb meteor
```

Clone this repository and run!

```bash
meteor
```

Please access to the displayed url.

* Configuration

Please set the price of hands at server/server.js.

