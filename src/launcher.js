import config from '@/init.config'
import ResizeSensor from 'css-element-queries/src/ResizeSensor'

import kifiLogo from '../images/kirjastot-fi.svg'

async function kirjastohakemisto (element) {
  if (!element) {
    throw new Error('Passed null element to kirjastohakemisto()')
  }

  const params = extractParams(element.dataset)
  const enableSandbox = !params.nosandbox
  const sandboxHeight = parseInt(params.height) || 'auto'

  sandboxed(enableSandbox).then(async ([window, viewport]) => {
    const scope = window.document
    const App = await load_app(params.widget)
    let wrapper = scope.createElement('div')
    wrapper.id = 'hakemisto-app-' + Math.floor((Math.random() * 99999))

    viewport.appendChild(wrapper)

    let app = new App(wrapper, params)

    if (enableSandbox && sandboxHeight === 'auto') {
      resizeSandbox(window.frameElement, viewport)
    }

    addAttribution(viewport)

    /*
     * MUST load the script sandboxed, otherwise Vue.js injects the styles from the app
     * to the parent document and messes everything up.
     */
    function load_app (appId) {
      return new Promise((resolve, reject) => {
        const path = `${config.path}/${appId}.js?v${process.env.BUILD_TIME}`
        const script = scope.createElement('script')

        script.src = path
        script.type = 'application/javascript'

        script.addEventListener('load', () => resolve(window['kirjastot.fi.' + appId]))

        scope.head.appendChild(script)
      })
    }
  })

  function extractParams (dataset) {
    let params = Object.create(null)

    for (let key in dataset) {
      if (key === 'hakemistoWidget') {
        params.widget = dataset[key]
      } else {
        params[key] = dataset[key].length ? dataset[key] : true
      }
    }

    if (!params.lang) {
      params.lang = document.documentElement.lang

      if (!params.lang) {
        params.lang = config.lang
      }
    }

    return params
  }

  function sandboxed (enableSandbox) {
    if (enableSandbox) {
      return new Promise((resolve, reject) => {
        let sandbox = createSandbox(params)

        sandbox.addEventListener('load', () => {
          /*
           * NOTE: Additional wrapper is required to ensure that widgets with multiple views
           * will also work with ResizeObserver. Vue replaces the parent node with its own for each view,
           * so we need to wrap that parent inside another element that is used as the observed element.
           */

          const scope = sandbox.contentWindow.document

          let base = scope.createElement('base')
          base.setAttribute('target', '_top')
          scope.head.appendChild(base)

          scope.documentElement.className = 'zxc-sandbox'
          let wrapper = scope.createElement('div')
          wrapper.className = 'zxc-safety-layer'

          scope.body.appendChild(wrapper)
          resolve([sandbox.contentWindow, wrapper])

          if (element.dataset.css) {
            const css = document.querySelector(element.dataset.css).innerText
            const style = sandbox.contentWindow.document.createElement('style')
            style.textContent = css
            sandbox.contentWindow.document.body.appendChild(style)
          }
        })

        element.appendChild(sandbox)
      })
    } else {
      return Promise.resolve([window, element])
    }
  }

  function createSandbox (params) {
    let sandbox = document.createElement('iframe')
    sandbox.style.width = '100%'
    sandbox.style.borderWidth = '0'

    if (params.height) {
      sandbox.style.height = params.height + 'px'
    }

    return sandbox
  }

  function resizeSandbox (sandbox, widget) {
    let body = sandbox.contentWindow.document.body

    function onResize () {
      // Add 20 px to work around Firefox's margin collapse.
      sandbox.style.height = widget.offsetHeight + 'px'
    }
    let observer = new ResizeSensor(widget, onResize)
  }

  function addAttribution (container) {
    const logo = document.createElement('img')
    logo.width = '80'
    logo.src = `data:image/svg+xml;utf8,${encodeURIComponent(kifiLogo)}`

    const link = document.createElement('a')
    link.href = 'https://hakemisto.kirjastot.fi'
    link.className = 'attribution'
    link.style.position = 'relative'
    // link.style.left = "calc(100% - 80px)";
    link.appendChild(logo)

    container.appendChild(link)
  }
}

window.addEventListener('load', () => {
  document.querySelectorAll('[data-hakemisto-widget]').forEach((container, i) => {
    // hakemisto_widget(container);

    kirjastohakemisto(container)
  })
})

export default kirjastohakemisto
