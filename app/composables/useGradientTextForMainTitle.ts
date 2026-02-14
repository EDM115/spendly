type Options = {
  /** Translation key to highlight */
  key?: string;

  /** Class to apply to highlighted occurrences */
  className?: string;

  /** Root element to scan (defaults to document.body) */
  root?: () => HTMLElement | null;

  /** Observe DOM changes and re-apply on newly added text */
  observe?: boolean;
}

function isTextNode(node: Node): node is Text {
  return node.nodeType === Node.TEXT_NODE
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function unwrapHighlights(markerAttr: string) {
  const spans = document.querySelectorAll<HTMLElement>(`span[${markerAttr}]`)

  spans.forEach((span) => {
    const parent = span.parentNode

    if (!parent) {
      return
    }

    parent.replaceChild(document.createTextNode(span.textContent ?? ""), span)
    // merges adjacent text nodes
    parent.normalize()
  })
}

export function useGradientTextForMainTitle(options: Options = {}) {
  const {
    locale,
    t,
  } = useI18n()

  const key = options.key ?? "main.title"
  const className = options.className ?? "gradient-text"
  const rootGetter = options.root ?? (() => document.body)
  const observe = options.observe ?? true

  // Unique marker so we can reliably undo/redo without touching other spans
  const markerAttr = `data-i18n-highlight-${key.replace(/[^a-z0-9_-]/gi, "_")}`

  let observer: MutationObserver | null = null
  let scheduled = false

  const apply = () => {
    const root = rootGetter()

    if (!root) {
      return
    }

    const phrase = t(key)

    if (!phrase) {
      return
    }

    // Remove previous highlights for this key (important if locale changes)
    unwrapHighlights(markerAttr)

    const re = new RegExp(escapeRegExp(phrase), "g")

    const filter: NodeFilter = {
      acceptNode(node: Node): number {
        const parent = node.parentNode

        if (!parent) {
          return NodeFilter.FILTER_REJECT
        }

        const parentNode = node.parentNode

        if (!(parentNode instanceof HTMLElement)) {
          return NodeFilter.FILTER_REJECT
        }

        // if parent already has the target class, don't wrap occurrences inside it
        if (parentNode.classList?.contains(className)) {
          return NodeFilter.FILTER_REJECT
        }

        // skip script/style/noscript + inputs/textareas
        const tag = parentNode.tagName?.toLowerCase()

        if (
          tag === "script"
          || tag === "style"
          || tag === "noscript"
          || tag === "textarea"
          || tag === "input"
        ) {
          return NodeFilter.FILTER_REJECT
        }

        // skip already-highlighted content
        if (parentNode.closest(`span[${markerAttr}]`)) {
          return NodeFilter.FILTER_REJECT
        }

        // quick check
        if (!node.nodeValue || !re.test(node.nodeValue)) {
          // reset lastIndex because we used .test with /g
          re.lastIndex = 0

          return NodeFilter.FILTER_REJECT
        }

        // reset lastIndex again (we'll use it below)
        re.lastIndex = 0

        return NodeFilter.FILTER_ACCEPT
      },
    }

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      filter,
    )

    const textNodes: Text[] = []
    let current: Node | null

    while ((current = walker.nextNode())) {
      if (isTextNode(current)) {
        textNodes.push(current)
      }
    }

    for (const textNode of textNodes) {
      const text = textNode.nodeValue ?? ""

      if (!text) {
        continue
      }

      // Find all matches
      const matches = [...text.matchAll(re)]

      if (matches.length === 0) {
        continue
      }

      const frag = document.createDocumentFragment()
      let lastIndex = 0

      for (const m of matches) {
        const start = m.index ?? 0
        const end = start + phrase.length

        // text before match
        if (start > lastIndex) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex, start)))
        }

        // highlighted match
        const span = document.createElement("span")

        span.className = className
        span.setAttribute(markerAttr, "true")
        span.textContent = text.slice(start, end)
        frag.appendChild(span)

        lastIndex = end
      }

      // remaining text
      if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)))
      }

      const parent = textNode.parentNode

      if (parent) {
        parent.replaceChild(frag, textNode)
      }
    }
  }

  const scheduleApply = () => {
    if (scheduled) {
      return
    }

    scheduled = true
    queueMicrotask(() => {
      scheduled = false
      apply()
    })
  }

  onMounted(() => {
    apply()

    if (observe) {
      observer = new MutationObserver(() => scheduleApply())
      const root = rootGetter()

      if (root) {
        observer.observe(root, {
          childList: true, subtree: true, characterData: true,
        })
      }
    }
  })

  // Re-apply when locale changes (or if your messages change at runtime)
  watch(locale, () => scheduleApply())

  onBeforeUnmount(() => {
    if (observer) {
      observer.disconnect()
    }

    observer = null
    unwrapHighlights(markerAttr)
  })

  return {
    reapply: apply,
  }
}
