#/bin/bash
#Generates an SVG from DOT file generate by the monitor
#graph_only option must be set
set -e
DATE=`date +'%Y%m%d%H%M%S'`
FILENAME='dotgraph_'$DATE
OUTPUT_FORMAT="png"

if ! [ -x "$(command -v dot)" ]
then
  echo "error: Graphviz not found";
  exit 1;
fi

node server > $FILENAME'.dot' && dot -T$OUTPUT_FORMAT $FILENAME'.dot' -o $FILENAME'.'$OUTPUT_FORMAT
echo 'Successfully generated '$FILENAME'.'$OUTPUT_FORMAT
