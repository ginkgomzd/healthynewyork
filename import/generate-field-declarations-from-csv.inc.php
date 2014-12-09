<?php
include_once('strip-text-qualifiers-from-row.inc.php');

/*
$filename = $argv[1];
$field_delimiter = $argv[2];
$text_qualifier = $argv[3];

var_dump( generate_field_declaration_from_csv($filename, $field_delimiter, $text_qualifier));
*/

/***
 * first row must contain column names
 * generates an array of field declarations from column labels
 ***/
function generate_field_declarations_from_csv($filename, $field_delimiter, $text_qualifier) {

  $field_declaration_tpl = <<<HEREDOC
  "%s": {    "index": %s, "data-type": "%s"   }
HEREDOC;

  $file = fopen($filename, 'r');
  $line = fgetcsv($file, null, $field_delimiter, $text_qualifier);
  fclose($file);

  strip_text_qualifiers_from_row($line, $text_qualifier);

  $declarations = array();
  foreach ($line as $idx => $field) {
    if (strpos($field, "\n") !== false) $field = str_replace("\n", '', $field);
    $data_type = (strpos(strtoupper($field), 'ID') !== false)? 'int' : 'varchar(512)';
    $declarations[] = sprintf( $field_declaration_tpl, $field, $idx, $data_type );
  }
//  var_dump($declarations);
//  var_dump(json_decode('{'.join(', ', $declarations).'}'));
  return json_decode(str_replace("\r", '', str_replace("\n", '', '{'.join(', ', $declarations).'}')), TRUE);
}
