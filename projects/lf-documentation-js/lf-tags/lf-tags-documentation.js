// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

// Called on a detached container before elements connect to the live DOM.
// Angular Elements caches inputs set pre-connect and applies them in ngAfterViewInit.
export function preInit(container, tagsService) {
  const tags = container.querySelector('#demoTags');
  if (tags) {
    tags.tagsService = tagsService;
    tags.initialTags = ['Reviewed'];
  }
}

export function init(tagsService) {
  const tags = document.getElementById('demoTags');
  const output = document.getElementById('demoOutput');
  tags.addEventListener('selectedTagsChanged', (event) => {
    output.value = JSON.stringify(event.detail, null, 2);
  });
}
