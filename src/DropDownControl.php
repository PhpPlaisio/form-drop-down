<?php
declare(strict_types=1);

namespace Plaisio\Form\Control;

use Plaisio\Helper\RenderWalker;

/**
 * Class for customizable dropdown select boxes with JavaScript.
 */
class DropDownControl extends SelectControl
{
  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Class for distinguishing dropdown controls from other select controls.
   *
   * @var string
   */
  public static string $cssClass = 'drop-down-control';

  /**
   * The pattern for ignoring certain characters in strings searching in options.
   *
   * @var string|null
   */
  private ?string $ignoreFilterPattern = null;

  /**
   * Whether to include a search input element.
   *
   * @var bool
   */
  private bool $search = true;

  /**
   * The placeholder of the search input element.
   *
   * @var string
   */
  private string $searchPlaceHolder = 'Search...';

  /**
   * The text of the select box when no option has been selected.
   *
   * @var string
   */
  private string $text = 'Select Option';

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * @inheritdoc
   */
  public function htmlControl(RenderWalker $walker): string
  {
    $this->addClass(self::$cssClass);
    $this->setAttrData('text', $this->text)
         ->setAttrData('ignore-filter-pattern', $this->ignoreFilterPattern)
         ->setAttrData('main-attributes',
                       json_encode(['class' => implode(' ', $walker->getClasses(self::$cssClass.'-main'))]))
         ->setAttrData('select-attributes',
                       json_encode(['class' => implode(' ', $walker->getClasses(self::$cssClass.'-select'))]))
         ->setAttrData('value-attributes',
                       json_encode(['class' => implode(' ', $walker->getClasses(self::$cssClass.'-value'))]))
         ->setAttrData('indicator-attributes',
                       json_encode(['class' => implode(' ', $walker->getClasses(self::$cssClass.'-indicator'))]))
         ->setAttrData('list-wrapper-attributes',
                       json_encode(['class' => implode(' ', $walker->getClasses(self::$cssClass.'-list-wrapper'))]))
         ->setAttrData('list-attributes',
                       json_encode(['class' => implode(' ', $walker->getClasses(self::$cssClass.'-list'))]))
         ->setAttrData('option-attributes',
                       json_encode(['class' => implode(' ', $walker->getClasses(self::$cssClass.'-option'))]));
    if ($this->search)
    {
      $this->setAttrData('search-attributes',
                         json_encode(['class'       => implode(' ', $walker->getClasses(self::$cssClass.'-search')),
                                      'placeholder' => $this->searchPlaceHolder]));
    }

    return parent::htmlControl($walker);
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Sets the pattern for ignoring certain characters in strings searching in options.
   *
   * @param string|null $ignoreFilterPattern The pattern. This regex pattern must be compatible with JavaScript and
   *                                         without leading and trailing slashes.
   *
   * @return $this
   */
  public function setIgnoreFilterPattern(?string $ignoreFilterPattern): self
  {
    $this->ignoreFilterPattern = $ignoreFilterPattern;

    return $this;
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Sets whether to include a search input element.
   *
   * @param bool $search Whether to include a search input element.
   *
   * @return $this
   */
  public function setSearch(bool $search): self
  {
    $this->search = $search;

    return $this;
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Sets the text of the select box when no option has been selected.
   *
   * @param string $searchPlaceHolder The text.
   *
   * @return $this
   */
  public function setSearchPlaceHolder(string $searchPlaceHolder): self
  {
    $this->searchPlaceHolder = $searchPlaceHolder;

    return $this;
  }

  //--------------------------------------------------------------------------------------------------------------------
  /**
   * Sets the text of the select box when no option has been selected.
   *
   * @param string $text The text.
   *
   * @return $this
   */
  public function setText(string $text): self
  {
    $this->text = $text;

    return $this;
  }

  //--------------------------------------------------------------------------------------------------------------------
}

//----------------------------------------------------------------------------------------------------------------------
