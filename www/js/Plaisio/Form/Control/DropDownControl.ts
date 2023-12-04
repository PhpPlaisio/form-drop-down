import {Cast} from 'Plaisio/Helper/Cast';
import {Kernel} from 'Plaisio/Kernel/Kernel';
import TriggeredEvent = JQuery.TriggeredEvent;

/**
 * Class for dropdown select boxes.
 */
export class DropDownControl
{
  //--------------------------------------------------------------------------------------------------------------------
  /**
   * All registered select boxes.
   */
  protected static selects: DropDownControl[] = [];

  /**
   * The div holding all elements of the dropdown box.
   */
  private $divMain: JQuery = $();

  /**
   * The div showing the value of the dropdown box.
   */
  private $divSelect: JQuery = $();

  /**
   * The list with the select options.
   */
  private $list: JQuery = $();

  /**
   * The wrapper of the unordered list with the select options.
   */
  private $listWrapper: JQuery = $();

  /**
   * The element for searching in the options.
   */
  private $search: JQuery = $();

  /**
   * The span of the open or closed indicator.
   */
  private $spanIndicator: JQuery = $();

  /**
   * The span that holds the selected value.
   */
  private $spanValue: JQuery = $();

  /**
   * Characters to ignore when search for options.
   */
  private readonly ignoreFilter: RegExp | null = null;

  /**
   * Whether this dropdown select box is open.
   */
  private open: boolean = false;

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Object constructor.
   *
   * @param $select The jQuery object of the select box.
   */
  public constructor(private $select: JQuery<Element>)
  {
    this.createDropDownBox();
    this.installEventHandlers();

    if (this.$select.attr('data-ignore-filter-pattern'))
    {
      this.ignoreFilter = new RegExp(this.$select.attr('data-ignore-filter-pattern') ?? '', 'g');
    }

    $select.css('display', 'none');
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Registers dropdown boxes as a DropDownControl.
   */
  public static init(): void
  {
    Kernel.onBeefyHtmlAdded(function (event: TriggeredEvent, $html: JQuery)
    {
      $html.find('select.drop-down-control').each(function ()
      {
        const $form = $(this);
        if (!$form.hasClass('is-registered'))
        {
          DropDownControl.selects.push(new DropDownControl($form));
          $form.addClass('is-registered');
        }
      });
    });
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Converts a string to lowercase and removes all diacritics.
   *
   * @param string The string.
   */
  public toLowerCaseNoDiacritics(string: string | null): string
  {
    if (string === null)
    {
      return '';
    }

    // See https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
    let tmp = string.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    if (this.ignoreFilter)
    {
      tmp = tmp.replace(this.ignoreFilter, '');
    }

    return tmp;
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Handles a click event outside the dropdown box.
   */
  private clickOutside(event: JQuery.TriggeredEvent): void
  {
    const classes = '.' + (this.$divMain.attr('class') ?? '').split(' ').join('.');
    if (!$(event.target).closest(classes).is(this.$divMain))
    {
      this.dropDownBoxClose();
    }
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Generates and inserts HTML code for the dropdown box.
   */
  private createDropDownBox(): void
  {
    this.removeMainDiv();

    switch (this.$select.find('option').length)
    {
      case 0:
        // Nothing to do.
        break;

      case 1:
        this.createDropDownBox1();
        break;

      default:
        this.createDropDownBox2();
    }
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Generates and inserts HTML code for the dropdown box with 1 element.
   */
  private createDropDownBox1(): void
  {
    this.createMainDiv();

    this.$divSelect = $('<div>').attr(JSON.parse(this.$select.attr('data-select-attributes') ?? ''))
                                .appendTo(this.$divMain);

    const $option = this.$select.find('option');
    $('<span>').attr(JSON.parse(this.$select.attr('data-value-attributes') ?? ''))
               .text(Cast.toManString($option.text(), ''))
               .appendTo(this.$divSelect);

    this.$divMain.insertAfter(this.$select);

    this.$select.val($option.prop('value'));
    this.$select.trigger('change');
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Generates and inserts HTML code for the dropdown box with 2 or more elements.
   */
  private createDropDownBox2(): void
  {
    this.createMainDiv();
    this.createSelectDiv();
    this.createListWrapper();
    this.createSearchInput();
    this.createList();

    this.$divMain.insertAfter(this.$select);

    if ((this.$listWrapper.height() ?? 0) > 200)
    {
      this.$list.css({
        'height':     '200px',
        'resize':     'vertical',
        'overflow-x': 'hidden',
        'overflow-y': 'auto'
      });
    }
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Creates an unordered list based on the select box.
   */
  private createList(): void
  {
    this.$list = $('<ul>').attr(JSON.parse(this.$select.attr('data-list-attributes') ?? ''));

    let $selected = null;
    const options = this.$select.find('option').get();

    const attributes = JSON.parse(this.$select.attr('data-option-attributes') ?? '{}');
    for (let i = 0; i < options.length; i += 1)
    {
      const $option = $(options[i]);
      const value   = $option.prop('value');
      let html      = $option.html();
      if (html === ' ')
      {
        html = '&nbsp';
      }

      attributes['data-value'] = value;
      const $li                = $('<li>').attr(attributes).html(html);
      if ($option.attr('disabled'))
      {
        $li.addClass('is-disabled');
      }
      else
      {
        const that = this;
        $li.on('click', function ()
        {
          that.optionSelected(value);

          that.$select.val(value);
          that.$select.trigger('change');
        });
      }

      if ($option.attr('selected'))
      {
        $selected = $li;
      }

      $li.appendTo(this.$list);
    }

    if ($selected)
    {
      $selected.trigger('click');
    }

    this.$list.appendTo(this.$listWrapper);
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Creates the div element that wraps the option list.
   */
  private createListWrapper(): void
  {
    this.$listWrapper = $('<div>').attr(JSON.parse(this.$select.attr('data-list-wrapper-attributes') ?? ''))
                                  .css('width', this.$select.outerWidth() ?? '');

    this.$listWrapper.appendTo(this.$divMain);
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Creates the outer div of the dropdown box.
   */
  private createMainDiv(): void
  {
    this.$divMain = $('<div>').attr(JSON.parse(this.$select.attr('data-main-attributes') ?? ''))
                              .css('width', this.$select.outerWidth() ?? '');
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Creates search input element.
   */
  private createSearchInput(): void
  {
    const attributes = this.$select.attr('data-search-attributes') ?? '';
    if (attributes !== '')
    {
      this.$search = $('<input>').attr(JSON.parse(attributes))
                                 .appendTo(this.$listWrapper);
    }
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Creates the div that mimics/replaces the select box.
   */
  private createSelectDiv(): void
  {
    this.$divSelect = $('<div>').attr(JSON.parse(this.$select.attr('data-select-attributes') ?? ''));

    this.$spanValue = $('<span>').attr(JSON.parse(this.$select.attr('data-value-attributes') ?? ''))
                                 .text(Cast.toManString(this.$select.attr('data-text'), ''))
                                 .appendTo(this.$divSelect);

    this.$spanIndicator = $('<span>').attr(JSON.parse(this.$select.attr('data-indicator-attributes') ?? ''))
                                     .addClass('is-closed')
                                     .appendTo(this.$divSelect);

    const that = this;
    this.$divSelect.on('click', function ()
    {
      that.dropDownBoxToggle();
    });

    this.$divSelect.appendTo(this.$divMain);
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Closes this dropdown select box.
   */
  private dropDownBoxClose(): void
  {
    if (this.open)
    {
      this.$spanIndicator.removeClass('is-open').addClass('is-closed');
      this.$listWrapper.slideToggle(400);
      this.open = false;
    }
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Opens this dropdown select box.
   */
  private dropDownBoxOpen(): void
  {
    if (!this.open)
    {
      this.$spanIndicator.addClass('is-open').removeClass('is-closed');

      const that = this;
      setTimeout(function ()
      {
        that.scrollSelectedInView('auto');
        that.$search.trigger('focus');
      }, 10);

      this.$listWrapper.slideToggle(400, function ()
      {
        that.scrollSelectedInView('smooth');
      });

      const width = Cast.toManFloat(this.$select.outerWidth() ?? null, 0) -
        parseFloat(this.$listWrapper.css('borderLeftWidth')) -
        parseFloat(this.$listWrapper.css('borderRightWidth'));
      this.$listWrapper.css('width', width);

      this.open = true;
    }
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Opens or closes this dropdown select box.
   */
  private dropDownBoxToggle(): void
  {
    if (this.open)
    {
      this.dropDownBoxClose();
    }
    else
    {
      this.dropDownBoxOpen();
    }
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Filter the options.
   */
  private filter(): void
  {
    const filter = this.toLowerCaseNoDiacritics(Cast.toManString(this.$search.val(), ''));

    const items = this.$list.find('li').get();
    for (let i = 0; i < items.length; i += 1)
    {
      const $item = $(items[i]);
      const value = this.toLowerCaseNoDiacritics($item.text());

      if (value.indexOf(filter) !== -1)
      {
        $item.css('display', '');
      }
      else
      {
        $item.css('display', 'none');
      }
    }
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Close an open dropdown box when clicked outside the dropdown box.
   */
  private installCloseDropBoxHandler(): void
  {
    const that = this;
    $('body').on('click', function (event: JQuery.TriggeredEvent)
    {
      that.clickOutside(event);
    });
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Installs event handlers.
   */
  private installEventHandlers(): void
  {
    this.installCloseDropBoxHandler();
    this.installFilterEventHandler();
    this.installInputEventHandler();
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Filters options according to the search box.
   */
  private installFilterEventHandler(): void
  {
    const that = this;

    // Clear the filter box (some browsers preserve the values on page reload).
    this.$search.val('');

    // Install event handler for ESC-key pressed in filter.
    this.$search.on('keydown', function (event: JQuery.KeyDownEvent)
    {
      // If the ESC-key was pressed or nothing is entered clear the value of the search box.
      if (event.key === 'Escape')
      {
        that.$search.val('').trigger('input');
      }
    });

    // Install event handler for enter pressed
    this.$search.on('keypress', function (event: JQuery.KeyPressEvent)
    {
      // If the entry key is pressed and one option only is not filtered out then select the value nd prevent form
      // submission.
      if (event.key === 'Enter')
      {
        event.preventDefault();

        const $filtered = that.$list.find('li:visible');
        if ($filtered.length === 1)
        {
          $filtered.first().trigger('click');
        }
      }
    });

    this.$listWrapper.on('keydown', function (event: JQuery.KeyDownEvent)
    {
      const $target = $(event.target);
      const target  = $target.get()[0];

      if (event.key === 'Enter' && target.tagName === 'LI' && !$target.hasClass('is-disabled'))
      {
        $target.trigger('click');
      }

      if (event.key === 'ArrowDown')
      {
        if ($target.get()[0].tagName === 'INPUT')
        {
          const $selected = that.$list.find('li.is-selected:not(.is-disabled):visible');
          if ($selected.length > 0)
          {
            that.moveFocusTo($selected);
          }
          else
          {
            const $first = that.$list.find('li:not(.is-disabled):visible');
            if ($first.length > 0)
            {
              that.moveFocusTo($first);
            }
          }
        }

        if (target.tagName === 'LI')
        {
          const $next = $target.nextAll('li:not(.is-disabled):visible');
          if ($next.length > 0)
          {
            that.moveFocusTo($next);
          }
        }
      }

      if (event.key === 'ArrowUp')
      {
        if (target.tagName === 'LI')
        {
          const $prev = $target.prevAll('li:not(.is-disabled):visible');
          if ($prev.length > 0)
          {
            that.moveFocusTo($prev);
          }
          else
          {
            that.moveFocusTo(that.$search);
          }
        }
      }
    });

    // Install event handler for changed filter value.
    this.$search.on('input', function ()
    {
      that.filter();
    });
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Observes the original select box for changes.
   */
  private installInputEventHandler(): void
  {
    const that = this;
    this.$select.on('input', function ()
    {
      that.optionSelected(Cast.toManString(that.$select.val(), ''));
    });
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Moves the focus to an element.
   *
   * @param $element The element to move the focus to.
   */
  private moveFocusTo($element: JQuery)
  {
    if ($element.length > 0)
    {
      $element.first().attr('tabindex', -1).trigger('focus');

      $element.get()[0].scrollIntoView({
        behavior: 'smooth',
        block:    'center'
      });
    }
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Closes the dropdown box and sets the selected value.
   *
   * @param value The value of the selected option.
   */
  private optionSelected(value: string): void
  {
    const $li  = this.$list.find('li[data-value="' + $.escapeSelector(value) + '"]');
    const text = $li.text();

    if (text === '')
    {
      this.$spanValue.html('&nbsp;');
    }
    else
    {
      this.$spanValue.text(text);
    }
    this.$list.find('li.is-selected').removeClass('is-selected');
    $li.addClass('is-selected');
    this.dropDownBoxClose();
    this.$search.val('');
    this.$search.trigger('input');
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Removes the outer div of the dropdown box, if any.
   */
  private removeMainDiv(): void
  {
    const data = JSON.parse(this.$select.attr('data-main-attributes') ?? '');
    this.$select.next('.' + data['class']).remove();
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Scrolls the selected value in to view.
   */
  private scrollSelectedInView(behavior: string): void
  {
    const element = this.$list.find('.is-selected').get()[0];
    if (element)
    {
      element.scrollIntoView({
        // @ts-ignore
        behavior: behavior,
        block:    'center'
      });
    }
  }
}

//----------------------------------------------------------------------------------------------------------------------
// Plaisio\Console\TypeScript\Helper\MarkHelper::md5: 99cdee549e602db731d218ee0e65939b
