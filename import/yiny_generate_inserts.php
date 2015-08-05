#!/usr/bin/php
<?php
include_once('generate-field-declarations-from-csv.inc.php');
include_once('strip-text-qualifiers-from-row.inc.php');
include_once('generate-sql-create-utils.inc.php');

$filename = $argv[1];
$DELIMITER = ',';
$TEXT_QUALIFIER = '"';
$REQUIRED = array('title'); #skip rows if required fields are present but empty


/*** END CONFIG ***/

$field_map = generate_field_declarations_from_csv($filename, $DELIMITER, $TEXT_QUALIFIER);


/***
 * probe field_map: 
 ***/
$deleted = false;
if (key_exists('deleted', $field_map)) {
  $deleted = $field_map['deleted']['index'];
  // remove from meta data to avoid confusion:
  unset($field_map['deleted']);
}

if (key_exists('Related content tags', $field_map)) {
  unset($field_map['Related content tags']);
}

$required = array();
foreach($REQUIRED as $key) {
  if (key_exists($key, $field_map)) {
    $required[] = $field_map[$key]['index'];
  }
}

$type = false;
if (key_exists('type', $field_map)) {
  $type = $field_map['type']['index'];
}

$link = false;
if (key_exists('link', $field_map)) {
  $link = $field_map['link']['index'];
}

$fd = fopen ($filename, "r");
while (!feof($fd) ) {

  /***
   * validate fields 
   ***/

    $line = fgetcsv($fd, null, $DELIMITER, $TEXT_QUALIFIER);
    if ($line === false) {
      continue;
    }
    $skip = false;
    if (is_numeric($deleted)) {
      if ($line[$deleted]) {
        $skip = true;
      }
    }
    foreach ($required as $req) {
      if (trim($line[$req]) == '') {
        $skip = true;
      }
    }
    if ($skip) {
      continue;
    }

  /***
   * transform fields 
   ***/

    if (is_numeric($type)) {
      $line[$type] = str_replace(' ', '_', strtolower(trim($line[$type])));
    }

    if(is_numeric($link)) {
      /*** '{"controller": "content_list", "content_type": "compare_costs", "page_title": "Compare Costs"}' ***/
      $fmt =  '{"controller": "content_list", "content_type": "%s", "page_title": "%s"}';
      $page_title = $line[$field_map['title']['index']];
      $line[$link] = sprintf($fmt, str_replace(' ', '_', strtolower(trim($page_title))), $page_title);
    }

      /* content_leaf?id= */
    if (key_exists('body', $field_map)) {
      $body_idx = $field_map['body']['index'];
      $body = $line[$body_idx];
      // rewrite internal links
      $body = preg_replace('#href="([0-9]*[^"])"#m', 'href="content_leaf?id=$1"', $body );
      //remove line-breaks
      $body = str_replace("\n", '', $body);
      //escape single-quotes:
      $body = str_replace("'", "\\'", $body);
      //save xforms
      $line[$body_idx] = $body; 
    }

  /***
   * concatenate fields:
   ***/
    $line_arr = array();
    foreach ($field_map as $field_name => $field_def) {
     // create associative array:
      $line_arr[$field_name] = $line[$field_def['index']];
    }
    $file_array[] = $line_arr;
}
fclose($fd); 

echo generate_sqlite_insert('content', $file_array, $field_map);
//DONE


/***
 * Generate HealthYI app db insert statements (SQLite) w/ tx.executeSql()
 ***/
function generate_sqlite_insert($table_name, $file_array, $field_map, $first_row_is_header = TRUE, $field_names = NULL) {

  if (is_null($field_names)) $field_names = '"'.join('", "', array_keys($field_map)).'"';

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

  $prefix = "tx.executeSql('INSERT INTO \"${table_name}\" (${field_names}) VALUES ";

  $tokens = array();
  for($n=0; $n<count($field_map); $n++) {
    $tokens[] = '?';
  }
  $prefix .= '('. join(',', $tokens) .')';
  $prefix .= "'";

  $statements = array();
  foreach ($rows as $row) {
    foreach ($row as $field) {
      if (!is_numeric($field)) {
        $field = "'$field'";
      }
    }
    $statements[] =  $prefix . ", [".join(', ', $row)."]";
  }

  return join(");\n", $statements) . ");\n";
}
