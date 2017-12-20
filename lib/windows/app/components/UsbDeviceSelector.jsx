/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Dropdown, MenuItem } from 'react-bootstrap';
import DropdownToggle from 'react-bootstrap/lib/DropdownToggle';
import DropdownMenu from 'react-bootstrap/lib/DropdownMenu';
import { Iterable } from 'immutable';

class UsbDeviceSelector extends React.Component {
    componentDidMount() {
        const {
            bindHotkey,
            toggleExpanded,
            hotkeyExpand,
            isEnabled,
        } = this.props;

        if (isEnabled) {
            bindHotkey(hotkeyExpand.toLowerCase(), () => {
                // Focusing the dropdown button, so that up/down arrow keys
                // can be used to select device.
                this.focusDropdownButton();
                toggleExpanded();
            });
        }
    }

    focusDropdownButton() {
        // eslint-disable-next-line react/no-find-dom-node
        const node = ReactDOM.findDOMNode(this);
        if (node) {
            const button = node.querySelector('button');
            if (button) {
                button.focus();
            }
        }
    }

    renderDeviceItems() {
        const {
            devices,
            onSelect,
            isLoading,
            menuItemCssClass,
            filter,
        } = this.props;

        if (!isLoading) {
            return devices
                .filter(filter)
                .map(device => (
                    <MenuItem
                        key={device.serialNumber}
                        className={menuItemCssClass}
                        eventKey={device.serialNumber}
                        onSelect={() => onSelect(device)}
                    >
                        {device.serialNumber}
                    </MenuItem>
                ),
            );
        }
        return null;
    }

    renderCloseItem() {
        const {
            selectedDevice,
            isLoading,
            onDeselect,
            menuItemCssClass,
        } = this.props;

        if (selectedDevice && !isLoading) {
            return (
                <MenuItem
                    className={menuItemCssClass}
                    eventKey="Close device"
                    onSelect={onDeselect}
                >
                    <div>Close device</div>
                </MenuItem>
            );
        }
        return null;
    }

    render() {
        const {
            isEnabled,
            selectedDevice,
            toggleExpanded,
            isExpanded,
            hotkeyExpand,
            cssClass,
            dropdownCssClass,
            dropdownMenuCssClass,
        } = this.props;

        if (!isEnabled) {
            return null;
        }

        const selectorText = selectedDevice || 'Select device';

        return (
            <span title={`Select device (${hotkeyExpand})`}>
                <div className={cssClass}>
                    <Dropdown id="usb-device-selector" open={isExpanded} onToggle={toggleExpanded}>
                        <DropdownToggle
                            className={dropdownCssClass}
                            title={selectorText}
                        />
                        <DropdownMenu
                            id="usb-device-selector-list"
                            className={dropdownMenuCssClass}
                        >
                            { this.renderDeviceItems() }
                            { this.renderCloseItem() }
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </span>
        );
    }
}

UsbDeviceSelector.propTypes = {
    isEnabled: PropTypes.bool,
    devices: PropTypes.oneOfType([
        PropTypes.instanceOf(Array),
        PropTypes.instanceOf(Iterable),
    ]).isRequired,
    selectedDevice: PropTypes.string,
    isLoading: PropTypes.bool,
    isExpanded: PropTypes.bool,
    toggleExpanded: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    onDeselect: PropTypes.func.isRequired,
    bindHotkey: PropTypes.func.isRequired,
    hotkeyExpand: PropTypes.string,
    cssClass: PropTypes.string,
    dropdownCssClass: PropTypes.string,
    dropdownMenuCssClass: PropTypes.string,
    menuItemCssClass: PropTypes.string,
    filter: PropTypes.func,
};

UsbDeviceSelector.defaultProps = {
    isEnabled: false,
    selectedDevice: '',
    isExpanded: false,
    isLoading: false,
    hotkeyExpand: 'Alt+P',
    cssClass: 'core-padded-row',
    dropdownCssClass: 'core-usb-device-selector core-btn btn-primary',
    dropdownMenuCssClass: 'core-dropdown-menu',
    menuItemCssClass: 'btn-primary',
    filter: () => true,
};

export default UsbDeviceSelector;
