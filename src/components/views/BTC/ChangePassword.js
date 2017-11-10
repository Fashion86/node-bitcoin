import React, { Component } from 'react'
import styled from 'styled-components'
import { createObserver, collect } from 'dop'

import routes from '/const/routes'
import styles from '/const/styles'

import { BTC } from '/api/Assets'
import { isPrivateKey, getAddressFromPrivateKey } from '/api/Assets/BTC'
import { minpassword } from '/api/crypto'

import state from '/store/state'
import { setHref, setPrivateKey, addNotification } from '/store/actions'
import { getAsset } from '/store/getters'

import Div from '/components/styled/Div'
import Button from '/components/styled/Button'
import Help from '/components/styled/Help'
import Input from '/components/styled/Input'
import Password from '/components/styled/Password'
import { Label, SubLabel } from '/components/styled/Label'
import {
    FormField,
    FormFieldLeft,
    FormFieldRight,
    FormFieldButtons
} from '/components/styled/Form'
import CenterElement from '/components/styled/CenterElement'





export default class ChangePasswordBTC extends Component {
    componentWillMount() {
        this.observer = createObserver(m => this.forceUpdate())
        this.observer.observe(state.view)

        // Initial state
        state.view = {
            oldpassword: '',
            password: '',
            repassword: '',
            isInvalidOldpassword: false
        }

        // binding
        this.onChangeOldpassword = this.onChangeOldpassword.bind(this)
        this.onChangePassword = this.onChangePassword.bind(this)
        this.onChangeRepassword = this.onChangeRepassword.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }
    componentWillUnmount() {
        this.observer.destroy()
    }
    shouldComponentUpdate() {
        return false
    }

    // Actions
    onChangeOldpassword(e) {
        const collector = collect()
        state.view.isInvalidOldpassword = false
        state.view.oldpassword = e.target.value
        collector.emit()
    }
    onChangePassword(e) {
        state.view.password = e.target.value
    }
    onChangeRepassword(e) {
        state.view.repassword = e.target.value
    }
    onSubmit(e) {
        e.preventDefault()
        const asset_id = state.location.path[1]
        const asset = getAsset(asset_id)
        const collector = collect()
        const private_key = BTC.unlock(asset.address, asset.private_key, state.view.oldpassword)
        if ( private_key ) {
            const name = asset.label || asset.address
            setPrivateKey(asset_id, private_key, state.view.password)
            addNotification(
                `You have changed the password of "${name}"`,
                styles.notificationColor.green
            )
            setHref(routes.summaryAsset(asset_id))
        }
        else
            state.view.isInvalidOldpassword = true

        collector.emit()
    }

    // Getters
    get isInvalidRepassword() {
        return (
            state.view.password.length > 0 &&
            state.view.repassword.length > 0 &&
            state.view.password.length === state.view.repassword.length &&
            state.view.password !== state.view.repassword
        )
    }


    render() {

        const isInvalidRepassword = this.isInvalidRepassword
        const isValidForm =
            state.view.oldpassword.length > 0 &&
            state.view.password.length >= minpassword &&
            state.view.password === state.view.repassword &&
            !state.view.isInvalidOldpassword &&
            !isInvalidRepassword

        return React.createElement(ChangePasswordBTCTemplate, {
            oldpassword: state.view.oldpassword,
            password: state.view.password,
            repassword: state.view.repassword,
            isInvalidOldpassword: state.view.isInvalidOldpassword,
            isInvalidRepassword: isInvalidRepassword,
            isValidForm: isValidForm,
            onChangeOldpassword: this.onChangeOldpassword,
            onChangePassword: this.onChangePassword,
            onChangeRepassword: this.onChangeRepassword,
            onSubmit: this.onSubmit
        })
    }
}

function ChangePasswordBTCTemplate({
    oldpassword,
    password,
    repassword,
    isInvalidOldpassword,
    isInvalidRepassword,
    isValidForm,
    onChangeOldpassword,
    onChangePassword,
    onChangeRepassword,
    onSubmit
}) {
    return (
        <div>
            <FormField>
                <FormFieldLeft>
                    <Label>Old password</Label>
                </FormFieldLeft>
                <FormFieldRight>
                    <Input
                        type="password"
                        width="100%"
                        value={oldpassword}
                        onChange={onChangeOldpassword}
                        error={'Invalid old password'}
                        invalid={isInvalidOldpassword}
                    />
                </FormFieldRight>
            </FormField>
            <FormField>
                <FormFieldLeft>
                    <Label>Password</Label>
                    <Help>
                        Make sure that you remember this. This password can't be
                        restored because we don't store it. For security reasons
                        you will be asked often for this password.
                    </Help>
                    <SubLabel>
                        This password encrypts your private key.
                    </SubLabel>
                </FormFieldLeft>
                <FormFieldRight>
                    <Password
                        minlength={minpassword}
                        value={password}
                        onChange={onChangePassword}
                        width="100%"
                        type="password"
                    />
                </FormFieldRight>
            </FormField>
            <FormField>
                <FormFieldLeft>
                    <Label>Repeat Password</Label>
                </FormFieldLeft>
                <FormFieldRight>
                    <Input
                        minlength={minpassword}
                        error={'Passwords do not match'}
                        invalid={isInvalidRepassword}
                        value={repassword}
                        onChange={onChangeRepassword}
                        width="100%"
                        type="password"
                    />
                </FormFieldRight>
            </FormField>

            <FormField>
                <FormFieldButtons>
                    <Button
                        width="200px"
                        disabled={!isValidForm}
                        onClick={onSubmit}
                    >
                        Change password
                    </Button>
                </FormFieldButtons>
            </FormField>
        </div>
    )
}