#! /bin/sh
PATH=/sbin:/usr/sbin:/bin:/usr/bin
DESC="Rabix registry"
NAME=rabix-registry
PROCESSNAME=node
CONFIG="/data/config/rabix-registry/config.json"
LOG_DIR="/data/log/rabix-registry"
BASEDIR=$(readlink -m "$(dirname $(readlink -e $0))/..")
DAEMON="/usr/local/bin/forever"
PIDFILE=/var/tmp/rabix-registry.pid
LOGS="-l ${LOG_DIR}/forever.log -o ${LOG_DIR}/rabix-registry.log -e ${LOG_DIR}/rabix-registry-err.log"
DAEMON_ARGS="start -pidFile ${PIDFILE} ${LOGS} -a ${BASEDIR}/app.js $CONFIG"
SCRIPTNAME=$BASEDIR/bin/$0

export NODE_ENV="production"

[ -x "$DAEMON" ] || exit 0

[ -r /etc/default/$NAME ] && . /etc/default/$NAME

. /lib/init/vars.sh

. /lib/lsb/init-functions

VERBOSE=yes

do_start()
{
mkdir -p $LOG_DIR
$DAEMON $DAEMON_ARGS || return 2
}

do_stop()
{
$DAEMON stop ${BASEDIR}/app.js
}

#do_reload() {
#start-stop-daemon --stop --signal 1 --quiet --pidfile $PIDFILE --name $PROCESSNAME
#return 0
#}

case "$1" in
  start)
[ "$VERBOSE" != no ] && log_daemon_msg "Starting $DESC" "$NAME"
do_start
case "$?" in
0|1) [ "$VERBOSE" != no ] && log_end_msg 0 ;;
2) [ "$VERBOSE" != no ] && log_end_msg 1 ;;
esac
;;
  stop)
[ "$VERBOSE" != no ] && log_daemon_msg "Stopping $DESC" "$NAME"
do_stop
case "$?" in
0|1) [ "$VERBOSE" != no ] && log_end_msg 0 ;;
2) [ "$VERBOSE" != no ] && log_end_msg 1 ;;
esac
;;
  status)
status_of_proc "$DAEMON" "$NAME" && exit 0 || exit $?
;;
  reload|force-reload)
log_daemon_msg "Reloading $DESC" "$NAME"
do_reload
log_end_msg $?
;;
  restart)
log_daemon_msg "Restarting $DESC" "$NAME"
do_stop
case "$?" in
 0|1)
do_start
case "$?" in
0) log_end_msg 0 ;;
1) log_end_msg 1 ;; # Old process is still running
*) log_end_msg 1 ;; # Failed to start
esac
;;
 *)
# Failed to stop
log_end_msg 1
;;
esac
;;
  *)
echo "Usage: $SCRIPTNAME {start|stop|status|restart}" >&2
exit 3
;;
esac

