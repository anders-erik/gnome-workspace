/**  extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
// import * as Meta from 'resource:///org/gnome/shell/ui/meta.js';

import { MessageTray } from 'resource:///org/gnome/shell/ui/messageTray.js';


let panel, panelBinding, globalPanelBinding;

let keyPressEvent;

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {

    // MY FIRST METHOD
    _onGlobalScroll(actor, event){
        console.log("")
        console.log("GLOBAL SCROLL EVENT")
        console.log("actor.name = ", actor.name)
        console.log("event = ", event)
        console.log("global = ", global)
        console.log("")

    }

    _init() {
        panel = Main.panel;
        panelBinding = panel.actor.connect('scroll-event',this._onScroll.bind(this));
        

        console.log("INTIINTINTINTITINT ITN TINT INIT")
        panelBinding = panel.actor.connect('scroll-event',this._onGlobalScroll.bind(this));
        globalPanelBinding = global.stage.connect('scroll-event',this._onGlobalScroll.bind(this));
        globalPanelBinding = global.top_window_group.connect('scroll-event',this._onGlobalScroll.bind(this));
        globalPanelBinding = global.window_group.connect('scroll-event',this._onGlobalScroll.bind(this));
        global.stage.connect("key-press-event", this._onGlobalScroll.bind(this))
        console.log("global = ", global)

        keyPressEvent = global.stage.connect('key-press-event', (actor, event) => {
            let keySymbol = event.get_key_symbol();
            let keyString = Clutter.keysym_to_unicode(keySymbol);
            log(`Key pressed: ${keyString}`);
            return Clutter.EVENT_PROPAGATE;
        });

        // https://stackoverflow.com/questions/28522031/how-to-handle-keyboard-events-in-gnome-shell-extensions
        // global.stage.connect("key-press-event", (widget, event, user_data) => {
        //     let [success, keyval] = event.get_keyval(); // integer
        //     let keyname = Gdk.keyval_name(keyval); // string keyname
        //     console.log("_+_+_++__+_++_+_+__++__")
        //     if (keyname === "Control_L") {
        //         // Dialog code or eg. this.keys_array.push("<Ctrl>");
        //     }
        // });



        super._init(0.0, _('My Shiny Indicator'));

        this.add_child(new St.Icon({
            icon_name: 'face-smile-symbolic',
            style_class: 'system-status-icon',
        }));

        let item = new PopupMenu.PopupMenuItem(_('Show Notification'));
        item.connect('activate', () => {
            Main.notify(_('Whatʼs up, folks?'));
        });
        this.menu.addMenuItem(item);


        // Listen for the keyboard shortcut (Ctrl+F1 in this example)
      global.display.connect('accelerator-activated', this._onAcceleratorActivated.bind(this));
    }


    _onAcceleratorActivated(_, action_group, action_name, target) {
      // Check if the shortcut matches what we're listening for
      if (action_name === 'custom-shortcut') {
        // Get the key and modifier information
        const [keyval, keycode, state] = target;
        const modifiers = this._getModifiers(state);
        const key = Clutter.keyval_name(keyval);

        // Create a notification message
        let notificationMessage = 'Keyboard shortcut triggered:\n';
        notificationMessage += `Key: ${key}\n`;
        notificationMessage += `Modifiers: ${modifiers.join(', ')}`;

        // Create a new source for the notification
        this._source = new MessageTray.Source('Keyboard Shortcut', 'input-keyboard');
        Main.messageTray.add(this._source);

        // Create a new notification
        this._notification = new MessageTray.Notification(this._source, 'Keyboard Shortcut Triggered', notificationMessage);
        this._notification.setTransient(true);
        this._source.notify(this._notification);

        // Log the shortcut event
        log(`Keyboard shortcut triggered: Key - ${key}, Modifiers - ${modifiers.join(', ')}`);
      }
    }

    _getModifiers(state) {
      const modifiers = [];
      if (state & Clutter.ModifierType.CONTROL_MASK) modifiers.push('Ctrl');
      if (state & Clutter.ModifierType.META_MASK) modifiers.push('Super');
      if (state & Clutter.ModifierType.SHIFT_MASK) modifiers.push('Shift');
      if (state & Clutter.ModifierType.ALT_MASK) modifiers.push('Alt');
      return modifiers;
    }

    _onScroll(actor, event) {
        console.log("ASALKSFHK FHKASHDFK")
  let source = event.get_source();
  if (source != actor) {
    let inStatusArea = panel._rightBox && panel._rightBox.contains && panel._rightBox.contains(source);
    if (inStatusArea) {
      return Clutter.EVENT_PROPAGATE;
    }
  }

  let motion;
  switch(event.get_scroll_direction()) {
    case Clutter.ScrollDirection.UP:
      motion = Meta.MotionDirection.LEFT;
      break;
    case Clutter.ScrollDirection.DOWN:
      motion = Meta.MotionDirection.RIGHT;
      break;
    default:
      return Clutter.EVENT_PROPAGATE;
  }
  let activeWs;
  if (global.screen) {
  	activeWs = global.screen.get_active_workspace();
  } else {
  	activeWs = global.workspaceManager.get_active_workspace();
  }
  let ws = activeWs.get_neighbor(motion);
  if(!ws) return Clutter.EVENT_STOP;

  let currentTime = Date.now();
  if (currentTime < lastScroll + scrollDelay) {
    if(currentTime<lastScroll) {
      lastScroll = 0;
    }
    else {
      return Clutter.EVENT_STOP;
    }
  }

  lastScroll = currentTime;
  Main.wm.actionMoveWorkspace(ws);
  return Clutter.EVENT_STOP;
}
});

export default class IndicatorExampleExtension extends Extension {
    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
        
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;


        if (keyPressEvent) {
            global.stage.disconnect(keyPressEvent);
            keyPressEvent = null;
        }
        
    }
}
