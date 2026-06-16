/**
 * Copy text using the async Clipboard API when available, otherwise `document.execCommand('copy')`.
 */
export async function writeClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);

  const selection = document.getSelection();
  const previousRange = selection?.rangeCount ? selection.getRangeAt(0) : null;
  textarea.select();

  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
    if (previousRange) {
      selection?.removeAllRanges();
      selection?.addRange(previousRange);
    }
  }
}

/** Minified `execCommand('copy')` fallback used inside inline onclick handlers. */
const INLINE_EXEC_COMMAND_COPY = `var a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.position='absolute';a.style.left='-9999px';document.body.appendChild(a);a.select();try{document.execCommand('copy');w()}finally{document.body.removeChild(a)}`;

/**
 * Inline onclick for {@link ClipboardText} static/prerendered copy (no island).
 * Selectors use single-quoted attribute values so the handler is safe inside `onclick="..."`.
 */
export const CLIPBOARD_TEXT_INLINE_ONCLICK = `var b=this,r=b.closest('[data-slot=\\'clipboard-text\\']'),t=b.getAttribute('data-copy-text')||'',w=function(){var c=r&&r.querySelector('[data-slot=\\'clipboard-text-copied-icon\\']'),i=r&&r.querySelector('[data-slot=\\'clipboard-text-copy-icon\\']'),s=r&&r.querySelector('[data-slot=\\'clipboard-text-status\\']');c&&c.classList.remove('translate-y-full','opacity-0');c&&c.classList.add('translate-y-0','opacity-100');i&&i.classList.add('-translate-y-full','opacity-0');i&&i.classList.remove('opacity-100');if(s)s.textContent=b.getAttribute('data-copied-text')||'Copied';clearTimeout(b._clipboardTextTimeout);b._clipboardTextTimeout=setTimeout(function(){c&&c.classList.add('translate-y-full','opacity-0');c&&c.classList.remove('translate-y-0','opacity-100');i&&i.classList.remove('-translate-y-full','opacity-0');i&&i.classList.add('opacity-100');if(s)s.textContent=''},1500)};if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(w).catch(function(){${INLINE_EXEC_COMMAND_COPY}})}else{${INLINE_EXEC_COMMAND_COPY}}`;

/**
 * Inline onclick for {@link BreadcrumbsClipboard} / `copyUrl` (static markup, no hydration).
 */
export const BREADCRUMBS_CLIPBOARD_INLINE_ONCLICK = `var b=this,t=b.getAttribute('data-copy-text')||'',c=b.querySelector('.bc-copy-icon'),k=b.querySelector('.bc-check-icon'),w=function(){c&&(c.style.display='none');k&&(k.style.display='flex');clearTimeout(b._bcClipboardTimeout);b._bcClipboardTimeout=setTimeout(function(){c&&(c.style.display='flex');k&&(k.style.display='none')},2000)};if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(w).catch(function(){${INLINE_EXEC_COMMAND_COPY}})}else{${INLINE_EXEC_COMMAND_COPY}}`;
