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

import SerialPort from 'serialport';
import libusb from 'usb';
import { isPortAvailable, decorateWithSerialNumber } from '../../../api/jlink';
import { logger } from '../../../api/logging';

export const DEVICES_LOAD = 'DEVICES_LOAD';
export const DEVICES_LOAD_SUCCESS = 'DEVICES_LOAD_SUCCESS';
export const DEVICES_LOAD_ERROR = 'DEVICES_LOAD_ERROR';
export const DEVICE_SELECTOR_TOGGLE_EXPANDED = 'DEVICE_SELECTOR_TOGGLE_EXPANDED';
export const DEVICE_SELECTED = 'DEVICE_SELECTED';
export const DEVICE_DESELECTED = 'DEVICE_DESELECTED';

function loadDevicesAction() {
    return {
        type: DEVICES_LOAD,
    };
}

function loadDevicesSuccessAction(devices) {
    return {
        type: DEVICES_LOAD_SUCCESS,
        devices,
    };
}

function loadDevicesErrorAction(message) {
    return {
        type: DEVICES_LOAD_ERROR,
        message,
    };
}

function selectorToggleExpandedAction() {
    return {
        type: DEVICE_SELECTOR_TOGGLE_EXPANDED,
    };
}

function deviceSelectedAction(device) {
    return {
        type: DEVICE_SELECTED,
        device,
    };
}

function getSerialPorts() {
    return new Promise((resolve, reject) => {
        SerialPort.list((listPortsError, ports) => {
            if (listPortsError) {
                reject(listPortsError);
            } else {
                decorateWithSerialNumber(ports)
                    .then(finalPorts => resolve(finalPorts))
                    .catch(decorateError => reject(decorateError));
            }
        });
    });
}

function getUsbDeviceStringDescriptor(usbDevice, descriptorIndex) {
    return new Promise((resolve, reject) => {
        usbDevice.getStringDescriptor(descriptorIndex, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}

function getUsbDeviceStringDescriptors(usbDevice, descriptorIndexes) {
    const promises = descriptorIndexes.map(index => (
        getUsbDeviceStringDescriptor(usbDevice, index)
    ));
    return Promise.all(promises);
}

function getUsbDeviceInfo(usbDevice) {
    return new Promise((resolve, reject) => {
        try {
            usbDevice.open();
            getUsbDeviceStringDescriptors(usbDevice, [
                usbDevice.deviceDescriptor.iSerialNumber,
                usbDevice.deviceDescriptor.iManufacturer,
                usbDevice.deviceDescriptor.iProduct,
            ]).then(descriptorValues => {
                usbDevice.close();
                resolve({
                    busNumber: usbDevice.busNumber,
                    deviceAddress: usbDevice.deviceAddress,
                    serialNumber: descriptorValues[0],
                    manufacturer: descriptorValues[1],
                    product: descriptorValues[2],
                });
            }).catch(error => reject(error));
        } catch (error) {
            resolve({});
        }
    });
}

function getUsbDevices() {
    return new Promise((resolve, reject) => {
        try {
            const usbDevices = libusb.getDeviceList();
            const promises = usbDevices.map(usbDevice => getUsbDeviceInfo(usbDevice));
            resolve(Promise.all(promises));
        } catch (error) {
            reject(new Error(`Unable to get USB devices: ${error.message}`));
        }
    });
}

function createUsbDeviceObject(usbDevice) {
    return {
        type: 'usb',
        comName: undefined,
        busNumber: usbDevice.busNumber,
        deviceAddress: usbDevice.deviceAddress,
        serialNumber: usbDevice.serialNumber,
        manufacturer: usbDevice.manufacturer,
        product: usbDevice.product,
        vendorId: usbDevice.vendorId,
        productId: usbDevice.productId,
    };
}

function createSerialDeviceObject(serialPort) {
    return {
        type: 'serialport',
        comName: serialPort.comName,
        busNumber: undefined,
        deviceAddress: undefined,
        serialNumber: serialPort.serialNumber,
        manufacturer: serialPort.manufacturer,
        product: undefined,
        vendorId: serialPort.vendorId,
        productId: serialPort.productId,
    };
}

function createDeviceObjects(usbDevices, serialPorts) {
    return usbDevices.map(usbDevice => createUsbDeviceObject(usbDevice))
        .concat(serialPorts.map(port => createSerialDeviceObject(port)));
}

export function loadDevices() {
    return dispatch => {
        dispatch(loadDevicesAction());
        Promise.all([
            getUsbDevices(),
            getSerialPorts(),
        ]).then(([usbDevices, serialPorts]) => {
            const devices = createDeviceObjects(usbDevices, serialPorts);
            dispatch(loadDevicesSuccessAction(devices));
        })
        .catch(error => (
            dispatch(loadDevicesErrorAction(`Unable to load devices: ${error.message}`))
        ));
    };
}

export function toggleSelectorExpanded() {
    return (dispatch, getState) => {
        const state = getState();
        if (!state.core.device.isSelectorExpanded) {
            dispatch(loadDevices());
        }
        dispatch(selectorToggleExpandedAction());
    };
}

export function selectDevice(device) {
    return dispatch => {
        if (device.type === 'serialport') {
            isPortAvailable(device.comName)
                .then(() => dispatch(deviceSelectedAction(device)))
                .catch(error => {
                    logger.error('Unable to open the port. Please power cycle the device ' +
                        'and try again.');
                    logger.debug(error.message);
                });
        } else {
            dispatch(deviceSelectedAction(device));
        }
    };
}

export function deselectDevice() {
    return {
        type: DEVICE_DESELECTED,
    };
}
