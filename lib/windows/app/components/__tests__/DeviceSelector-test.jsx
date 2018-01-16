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

/* eslint-disable import/first */

// Do not render react-bootstrap components in tests
jest.mock('react-bootstrap', () => ({
    Dropdown: 'Dropdown',
    MenuItem: 'MenuItem',
}));
jest.mock('react-bootstrap/lib/DropdownToggle', () => 'DropdownToggle');
jest.mock('react-bootstrap/lib/DropdownMenu', () => 'DropdownMenu');

import React from 'react';
import renderer from 'react-test-renderer';
import DeviceSelector from '../DeviceSelector';

describe('DeviceSelector', () => {
    it('should render empty device list, not expanded', () => {
        expect(renderer.create(
            <DeviceSelector
                devices={[]}
                toggleExpanded={() => {}}
                onSelect={() => {}}
                onDeselect={() => {}}
                bindHotkey={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render empty device list, expanded', () => {
        expect(renderer.create(
            <DeviceSelector
                devices={[]}
                isExpanded
                toggleExpanded={() => {}}
                onSelect={() => {}}
                onDeselect={() => {}}
                bindHotkey={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render two serialport devices', () => {
        expect(renderer.create(
            <DeviceSelector
                devices={[
                    {
                        type: 'serialport',
                        comName: '/dev/tty0',
                        serialNumber: '123456',
                    }, {
                        type: 'serialport',
                        comName: '/dev/tty1',
                        serialNumber: '456789',
                    },
                ]}
                isExpanded
                toggleExpanded={() => {}}
                onSelect={() => {}}
                onDeselect={() => {}}
                bindHotkey={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render one serialport and one usb device', () => {
        expect(renderer.create(
            <DeviceSelector
                devices={[
                    {
                        type: 'serialport',
                        comName: '/dev/tty0',
                        serialNumber: '123456',
                    }, {
                        type: 'usb',
                        serialNumber: '456789',
                        product: 'J-Link',
                    },
                ]}
                isExpanded
                toggleExpanded={() => {}}
                onSelect={() => {}}
                onDeselect={() => {}}
                bindHotkey={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render only devices that have a serial number by default', () => {
        expect(renderer.create(
            <DeviceSelector
                devices={[
                    {
                        type: 'serialport',
                        comName: '/dev/tty0',
                        serialNumber: '123456',
                    }, {
                        type: 'serialport',
                        comName: '/dev/tty1',
                    },
                ]}
                isExpanded
                toggleExpanded={() => {}}
                onSelect={() => {}}
                onDeselect={() => {}}
                bindHotkey={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render devices with custom filter', () => {
        expect(renderer.create(
            <DeviceSelector
                devices={[
                    {
                        type: 'serialport',
                        comName: '/dev/tty0',
                        serialNumber: '123456',
                        vendorId: '0x1234',
                    }, {
                        type: 'usb',
                        serialNumber: '456789',
                    },
                ]}
                isExpanded
                toggleExpanded={() => {}}
                onSelect={() => {}}
                onDeselect={() => {}}
                bindHotkey={() => {}}
                filter={device => device.type === 'usb'}
            />,
        )).toMatchSnapshot();
    });

    it('should render devices with custom device details', () => {
        expect(renderer.create(
            <DeviceSelector
                devices={[
                    {
                        type: 'serialport',
                        comName: '/dev/tty0',
                        serialNumber: '123456',
                        manufacturer: 'SEGGER',
                    }, {
                        type: 'usb',
                        serialNumber: '456789',
                        manufacturer: 'Nordic Semiconductor',
                    },
                ]}
                isExpanded
                toggleExpanded={() => {}}
                onSelect={() => {}}
                onDeselect={() => {}}
                bindHotkey={() => {}}
                deviceDetailsParser={device => device.manufacturer}
            />,
        )).toMatchSnapshot();
    });

    it('should render two devices, one selected', () => {
        expect(renderer.create(
            <DeviceSelector
                devices={[
                    {
                        type: 'serialport',
                        comName: '/dev/tty0',
                        serialNumber: '123456',
                    }, {
                        type: 'usb',
                        serialNumber: '456789',
                    },
                ]}
                selectedDevice={{
                    type: 'usb',
                    serialNumber: '456789',
                }}
                isExpanded
                toggleExpanded={() => {}}
                onSelect={() => {}}
                onDeselect={() => {}}
                bindHotkey={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render empty list while loading', () => {
        expect(renderer.create(
            <DeviceSelector
                devices={[
                    {
                        type: 'serialport',
                        comName: '/dev/tty0',
                        serialNumber: '123456',
                    },
                ]}
                isExpanded
                isLoading
                toggleExpanded={() => {}}
                onSelect={() => {}}
                onDeselect={() => {}}
                bindHotkey={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render empty list while loading and device is selected', () => {
        expect(renderer.create(
            <DeviceSelector
                devices={[
                    {
                        type: 'serialport',
                        comName: '/dev/tty0',
                        serialNumber: '123456',
                    },
                ]}
                selectedDevice={{
                    type: 'serialport',
                    comName: '/dev/tty0',
                    serialNumber: '123456',
                }}
                isExpanded
                isLoading
                toggleExpanded={() => {}}
                onSelect={() => {}}
                onDeselect={() => {}}
                bindHotkey={() => {}}
            />,
        )).toMatchSnapshot();
    });
});
