<?php
/***
 * given an array of (valid SQL) field definitions 
 *  
*/
function generate_table_definition(
  $field_definitions
, $table_name
,  $create_table_tpl = 'CREATE TABLE `%s` ( %s );'
) {

  if( is_null($table_name)) throw new exception("generate_table_definition() requires a table name");

  return sprintf($create_table_tpl, $table_name, join(', ', $field_definitions));
}

function generate_field_definitions($field_map, $field_definition_tpl = '`%s` %s NULL' ) {
  $field_definitions = array();
  foreach ($field_map as $field_name => $field) {
      $field_definitions[] = sprintf($field_definition_tpl, $field_name, $field['data-type']);
  }

  return $field_definitions;
}

function generate_extended_insert($table_name, $file_array, $field_map, $first_row_is_header = TRUE, $field_names = NULL) {

  if (is_null($field_names)) $field_names = '`'.join('`, `', array_keys($field_map)).'`';

  $rows = array();
  foreach ( $file_array as $line )
  {
    $row = array();
    foreach ($field_map as $field_name => $field_def) {
	  $field = $line[$field_name];
	  // if value is a string, quote it:
        if (strpos($field_def['data-type'], 'char') !== false) $field = "'{$field}'";
        $row[] = $field;
    }
    $rows[] = $row;
  }
  if ($first_row_is_header) array_shift($rows);

  $insert = "INSERT INTO ${table_name} (${field_names}) VALUES ";
  $values = array();
  foreach ($rows as $row) {
    $values[] =  "( ".join(', ', $row)." )";
  }

  return $insert . join(', ', $values) . ';';
}
