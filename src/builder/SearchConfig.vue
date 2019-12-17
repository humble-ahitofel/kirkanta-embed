<template>
  <div class="custom-options" @change="onChange">
    <div class="details-group">
      <b-form-group id="option-city" label-for="o-city">
        <details>
          <summary>{{ $t('search.municipalities.title') }}</summary>
          <small class="form-text">{{ $t('search.municipalities.info') }}</small>
          <auto-complete id="o-city" name="x-city" :value-key="'id'" :label-key="'name'" v-model="options.city" :suggestions="citySuggestions" @input="onCityAutoComplete" :multiple="true"/>
        </details>
      </b-form-group>

      <b-form-group id="option-consortium" label-for="o-consortium">
        <details>
          <summary>{{ $t('search.consortiums.title') }}</summary>
          <small class="form-text">{{ $t('search.consortiums.info') }}</small>
          <auto-complete id="o-consortium" name="x-consortium" :value-key="'id'" :label-key="'name'" v-model="options.consortium" :suggestions="consortiumSuggestions" @input="onConsortiumAutoComplete" :multiple="true"/>
        </details>
      </b-form-group>

      <b-form-group id="option-library" label-for="o-library">
        <details>
          <summary>{{ $t('search.libraries.title') }}</summary>
          <small class="form-text">{{ $t('search.libraries.info') }}</small>
          <auto-complete id="o-library" name="x-library" :value-key="'id'" :label-key="'name'" v-model="options.library" :suggestions="librarySuggestions" @input="onLibraryAutoComplete" :multiple="true"/>
        </details>
      </b-form-group>

      <b-form-group id="option-type" label-for="o-type">
        <details>
          <summary>{{ $t('search.libraries.choose-types') }}</summary>
          <b-form-checkbox-group id="o-type" name="type" v-model="options.type" :options="typeOptions"/>
        </details>
      </b-form-group>
    </div>

    <div class="details-group">
      <b-form-group id="o-contact-info">
        <details>
          <summary>{{ $t('contact-info.section-title') }}</summary>
          <span class="section-label">{{ $t('contact-info.scope') }}</span>
          <b-form-radio-group v-model="options.disable">
            <b-form-radio :value="null">{{ $t('contact-info.show-all') }}</b-form-radio>
            <b-form-radio value="staff">{{ $t('contact-info.hide-staff') }}</b-form-radio>
          </b-form-radio-group>
        </details>
      </b-form-group>
      <b-form-group id="o-expand-mode">
        <details>
          <summary>{{ $t('schedules.title') }}</summary>
          <span class="section-label">{{ $t('schedules.expand.title') }}</span>
          <b-form-radio-group v-model="options.expandMode">
            <b-form-radio :value="null">{{ $t('schedules.expand.none') }}</b-form-radio>
            <b-form-radio value="current">{{ $t('schedules.expand.current-day') }}</b-form-radio>
            <b-form-radio value="all">{{ $t('schedules.expand.all') }}</b-form-radio>
          </b-form-radio-group>
        </details>
      </b-form-group>
    </div>

    <div class="ml-3 mb-3">
      <b-form-checkbox v-model="pagingEnabled" :value="true" :unchecked-value="false">
        {{ $t('builder.use-paging') }}
      </b-form-checkbox>
    </div>
  </div>
</template>

<script>
import AutoComplete from './AutoComplete.vue'

import { libraryAutoComplete, cityAutoComplete, consortiumAutoComplete } from '../mixins/autocomplete'

export default {
  data: () => ({
    citySuggestions: [],
    cityValues: [],
    librarySuggestions: [],
    consortiumSuggestions: [],
    options: {
      library: null,
      city: null,
      consortium: null,
      type: null,
      noPaging: false
    },
    typeOptions: null
  }),
  created () {
    this.typeOptions = [
      { value: 'library main_library', text: this.$t('search.libraries.type.municipal') },
      { value: 'mobile', text: this.$t('search.libraries.type.mobile') },
      // { value: "vocational_college", text: this.$t("Vocational college library") },
      { value: 'polytechnic', text: this.$t('search.libraries.type.polytechnic') },
      { value: 'university', text: this.$t('search.libraries.type.university') },
      { value: 'special', text: this.$t('search.libraries.type.special') },
      { value: 'home_service institutional children school vocational_college', text: this.$t('search.libraries.type.other') }
    ]
  },
  computed: {
    pagingEnabled: {
      get () {
        return !this.noPaging
      },
      set (value) {
        this.options.noPaging = !value
        // this.onChange()
      }
    }
  },
  methods: {
    async onLibraryAutoComplete (name) {
      this.librarySuggestions = await libraryAutoComplete(name)
    },
    async onCityAutoComplete (name) {
      this.citySuggestions = await cityAutoComplete(name)
    },
    async onConsortiumAutoComplete (name) {
      this.consortiumSuggestions = await consortiumAutoComplete(name)
    },
    onSelectCity (city) {
      this.cityValues.push(city)
    },
    onChange (event) {
      this.$emit('options', this.options)
    }
  },
  watch: {
    cityValues () {
      this.options.city = this.cityValues.map((city) => city.id).join(' ')
    },
    options: {
      handler () {
        this.$emit('options', this.options)
      },
      deep: true
    }
  },
  components: { AutoComplete }
}
</script>
