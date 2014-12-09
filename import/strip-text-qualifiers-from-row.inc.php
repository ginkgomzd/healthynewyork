<?php

/***
 * loops through items in array and removes the given text-qualifier 
 * from the beginning and end of the field
 *
 * return: void
 * @param: &$row array
 * @param: $text_qualifier string
 ***/
function strip_text_qualifiers_from_row(&$row, $text_qualifier) {
  $full_line = join(',', $row);

  if ( strpos($full_line, $text_qualifier) !== false ) {
    foreach ($row as $idx => $field) {
      if (strpos($field, $text_qualifier) === 0) $field = substr($field, 1);
      if (strrpos($field, $text_qualifier) === (strlen($field)-1)) $field = substr($field, 0, strlen($field)-2);
      $row[$idx] = $field;
    }
  }
}
