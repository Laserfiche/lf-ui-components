import { Directive } from '@angular/core';
import { TreeNode } from '../utils/lf-tree.service';

enum TraversalKeys {
  ArrowDown = 'ArrowDown',
  ArrowUp = 'ArrowUp',
  ArrowRight = 'ArrowRight',
  ArrowLeft = 'ArrowLeft',
  Enter = 'Enter',
  Space = 'Space',
  Tab = 'Tab'
}

@Directive()
export abstract class LfTreeKeysDirective {
  /** @internal */
  focusedElement: HTMLElement | undefined;
  /** @internal */
  selectedClassName = 'lf-tree-focused-element';

  /** @internal */
  constructor() {}

  /** @internal */
  abstract onClickTreeNode(node: TreeNode, event?: MouseEvent): void;

  /** @internal */
  private onTreeTraversal(event: KeyboardEvent) {
    let nextElement;
    if (!Object.values(TraversalKeys).includes(event.code as any)) {
      return;
    }
    switch (event.code) {
      case TraversalKeys.ArrowDown:
      case TraversalKeys.ArrowUp:
        nextElement = (event.code === TraversalKeys.ArrowDown
          ? this.focusedElement?.nextElementSibling
          : this.focusedElement?.previousElementSibling) as HTMLElement;
        this.setFocusItem(nextElement);
        break;
      case TraversalKeys.Tab:
        nextElement = (event.shiftKey
          ? this.focusedElement?.previousElementSibling
          : this.focusedElement?.nextElementSibling) as HTMLElement;
        this.setFocusItem(nextElement);
        break;
      case TraversalKeys.ArrowRight:
      case TraversalKeys.ArrowLeft:
      case TraversalKeys.Enter:
      case TraversalKeys.Space:
        this.handleNodeOpeningKeys(event.code);
        break;
    }
  }

  /** @internal */
  private handleNodeOpeningKeys(code: string): void {
    if (!this.focusedElement) {
      return;
    }

    // Open the node if it can be
    const toggle = this.focusedElement.querySelector('[matTreeNodeToggle]') as HTMLElement;
    if (toggle) {
      switch (code) {
        case TraversalKeys.ArrowRight:
          if (this.focusedElement.getAttribute('aria-expanded') === 'false') {
            toggle.click();
          } else {
            // If on open node moved the focus forward
            this.setFocusItem(this.focusedElement.nextElementSibling as HTMLElement);
          }
          break;
        case TraversalKeys.ArrowLeft:
          if (this.focusedElement.getAttribute('aria-expanded') === 'true') {
            toggle.click();
          } else {
            // If on open node moved the focus forward
            this.setFocusItem(this.focusedElement.previousElementSibling as HTMLElement);
          }
          break;
        case TraversalKeys.Enter:
        case TraversalKeys.Space:
          toggle.click();
          break;
      }
    }
  }

  /** @internal */
  onKeyDownEvent(node: TreeNode, event: KeyboardEvent) {
    const onTab =  (event.code == TraversalKeys.Tab);
    const firstTimeAccessElement = (!this.focusedElement);
    const isLastTreeNode = (!firstTimeAccessElement && (this.focusedElement?.nextElementSibling == null));
    const isFirstTreeNode = (firstTimeAccessElement || (this.focusedElement?.previousElementSibling == null));
    const withShiftKey = event.shiftKey;
    const shouldTabOut = (onTab && isLastTreeNode && !withShiftKey);
    const shouldTabIn = (onTab && isFirstTreeNode && withShiftKey);
    const shouldCustomKeyBehavior = (!shouldTabIn && !shouldTabOut);
    if (shouldCustomKeyBehavior) {
        event.cancelBubble = true;
        if (event.stopPropagation) {
          event.stopPropagation();
        }
        if (event.preventDefault) {
          event.preventDefault();
        }
        if (event.code === TraversalKeys.Enter || event.code === TraversalKeys.Space) {
          this.onClickTreeNode(node);
        }
        this.onTreeTraversal(event);
      }
    }

  /** @internal */
  setFocusItem(nextElement: HTMLElement) {
    if (nextElement == null) {
      return;
    }
    if (this.focusedElement != null) {
      this.focusedElement.tabIndex = -1;
      this.focusedElement.classList.remove(this.selectedClassName);
    }
    nextElement.tabIndex = 0;
    nextElement.classList.add(this.selectedClassName);
    this.focusedElement = nextElement;
    this.focusedElement.focus();
  }
}
