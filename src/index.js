const plugin = {
  install(
    Vue,
    options = {
      defaults: {},
      path: 'settings.json',
      db: null,
    },
  ) {
    if (!options.db) {
      console.error('You must specify a lowdb instance! see https://github.com/typicode/lowdb#usage');
      return;
    }

    // merge strategies
    const strategies = Vue.config.optionMergeStrategies;
    strategies.lowdb = strategies.provide;

    // load the db

    // set defaults
    options.db.defaults(options.defaults).write();

    // must be es5 function
    /**
     * Start tracking a prop
     * @param dataKey - Corresponding data key
     * @param lowdbEntry - lowdb key path
     */
    // eslint-disable-next-line
    Vue.prototype.$track = function (dataKey, lowdbEntry) {
      // add watch to keep track of the prop, watch deep
      // eslint-disable-next-line
      const unwatch = this.$watch(
        dataKey,
        (newVal) => {
          // updatelowdb path with new object on change
          options.db.update(lowdbEntry, () => newVal).write();
        },
        {
          deep: true,
        },
      );

      // keep association
      this.$lowdbTracked[dataKey] = {
        entry: lowdbEntry,
        unwatch,
      };

      // setvue data key to current value in the db
      this[dataKey] = options.db.get(lowdbEntry).value();
    };

    // must be es5 function
    // untrack a prop
    // eslint-disable-next-line
    Vue.prototype.$untrack = function (dataKey) {
      this.$lowdbTracked[dataKey].unwatch();
      delete this.$lowdbTracked[dataKey];
    };

    Vue.mixin({
      beforeCreate() {
        // const self = this;

        this.$lowdbTracked = {};

        /* this.$settings = new Proxy(db, {
          // eslint-disable-next-line
          get: function(obj, prop) {
            console.log('db accessed', obj, prop);
            /!* if (prop === '__actions__') {
              self.$update();
            } *!/
            return obj[prop];
          },
        }); */

        // accessible db
        this.$settings = options.db;
      },
      created() {
        // getlowdb binding
        const { lowdb } = this.$options;

        // if no bindings return
        if (!lowdb) return;

        // for each binding, bind the data value to the corresponfing lowdb path
        Object.keys(lowdb).forEach((key) => {
          this.$track(key, lowdb[key]);
        });
      },
      // untrack everything
      beforeDestroy() {
        Object.keys(this.$lowdbTracked).forEach((key) => {
          this.$untrack(key);
        });
      },
    });
  },
};

// Install by default if using the script tag
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin);
}

export default plugin;
