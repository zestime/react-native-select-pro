import React, {
    ForwardedRef,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useReducer,
    useRef,
} from 'react';
import { StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';

import { MAX_HEIGHT_LIST } from '../../constants/styles';
import { initialData, reducer } from '../../state/reducer';
import { Action } from '../../state/types';
import type {
    OnOutsidePress,
    OnPressOptionType,
    OnPressSelectControlType,
    OptionType,
    SelectProps,
    SelectRef,
} from '../../types';
import { OptionsList } from '../options-list';
import { SelectControl } from '../select-control';

export const Select = forwardRef((props: SelectProps, ref: ForwardedRef<SelectRef>) => {
    const {
        options,
        clearable = true,
        closeDropdownOnSelect = true,
        defaultOption,
        disabled = false,
        flatListProps,
        hideSelectControlArrow,
        noOptionsText = 'No options',
        onSelect,
        onChangeText,
        onDropdownOpened,
        onDropdownClosed,
        optionSelectedStyle,
        optionStyle,
        optionTextStyle,
        placeholderText = 'Select...',
        searchable = false,
        searchPattern = (payload: string) => `(${payload})`,
        scrollToSelectedOption = true,
        selectContainerStyle,
        selectControlButtonsContainerStyle,
        selectControlClearOptionButtonStyle,
        selectControlClearOptionImageStyle,
        selectControlClearOptionButtonHitSlop,
        selectControlClearOptionA11yLabel,
        selectControlOpenDropdownA11yLabel,
        selectControlCloseDropdownA11yLabel,
        selectControlDisabledStyle,
        selectControlStyle,
        selectControlTextStyle,
        optionsListStyle,
        NoOptionsComponent,
        OptionComponent,
    } = props;
    const [
        {
            isOpened,
            selectedOption,
            optionsData,
            openedPosition,
            searchValue,
            searchedOptions,
            searchInputRef,
        },
        dispatch,
    ] = useReducer(reducer, initialData);
    const { aboveSelectControl } = openedPosition;

    const containerRef = useRef<View>(null);

    useEffect(() => {
        if (!Array.isArray(options)) {
            console.error('You must pass array in the options prop');
            return;
        }

        if (options.length > 0) {
            dispatch({ type: Action.SetOptionsData, payload: options });

            if (typeof defaultOption === 'object') {
                dispatch({ type: Action.SelectOption, payload: defaultOption });
            }
        }
    }, [options]);

    useEffect(() => {
        if (onChangeText) {
            onChangeText(searchValue);
        }
    }, [searchValue]);

    useImperativeHandle(ref, () => ({
        clear: () => {
            dispatch({ type: Action.SelectOption, payload: null });
            dispatch({ type: Action.SetOptionsData, payload: options });
        },
        open: () => {
            if (containerRef.current && !disabled) {
                dispatch({
                    type: Action.Open,
                });
                setPosition();
            }
        },
        close: () => {
            dispatch({
                type: Action.Close,
            });
        },
    }));

    const hideKeyboardIfNeeded = () => {
        // TODO: Better condition handling, however, typo error appears in every combination
        if (searchInputRef && (searchInputRef as any).current) {
            (searchInputRef as any).current.blur();
        }
    };

    const onPressOption: OnPressOptionType = (option: OptionType) => {
        if (closeDropdownOnSelect) {
            dispatch({ type: Action.Close });
        }
        dispatch({ type: Action.SelectOption, payload: option });
        if (searchable) {
            dispatch({ type: Action.SetSearchValue, payload: option.label });
        }
        dispatch({ type: Action.SetOptionsData, payload: options });
        if (option) {
            hideKeyboardIfNeeded();
        }
    };

    const windowDimensions = useWindowDimensions();

    const setPosition = () => {
        if (containerRef.current) {
            containerRef.current.measure((_x, _y, width, height, pageX, pageY) => {
                const fromProp = StyleSheet.flatten(optionsListStyle)?.maxHeight;
                let listHeight = MAX_HEIGHT_LIST;
                // TODO string values like percents
                if (typeof fromProp === 'number') {
                    listHeight = StyleSheet.flatten(optionsListStyle).maxHeight as number;
                }

                const isOverflow = pageY + height + listHeight > windowDimensions.height;
                dispatch({
                    type: Action.SetPosition,
                    payload: {
                        width,
                        top: isOverflow ? pageY - listHeight : pageY + height,
                        left: pageX,
                        aboveSelectControl: isOverflow,
                    },
                });
            });
        }
    };

    const onPressSelectControl: OnPressSelectControlType = () => {
        if (isOpened) {
            dispatch({
                type: Action.Close,
            });
            return;
        }
        setPosition();
        if (containerRef.current) {
            dispatch({
                type: Action.Open,
            });
        }
    };

    const onOutsidePress: OnOutsidePress = () => {
        dispatch({ type: Action.Close });
        dispatch({ type: Action.SetOptionsData, payload: options });
        if (searchable && selectedOption?.label) {
            dispatch({
                type: Action.SetSearchValue,
                payload: selectedOption.label,
            });
        }
        hideKeyboardIfNeeded();
    };

    useEffect(() => {
        if (isOpened) {
            onDropdownOpened?.();
        } else {
            onDropdownClosed?.();
        }
    }, [isOpened]);

    return (
        <View onLayout={setPosition} style={[styles.relative, selectContainerStyle]}>
            <SelectControl
                aboveSelectControl={aboveSelectControl}
                clearable={clearable}
                disabled={disabled}
                dispatch={dispatch}
                hideSelectControlArrow={hideSelectControlArrow}
                isOpened={isOpened}
                onPressSelectControl={onPressSelectControl}
                onSelect={onSelect}
                options={options}
                placeholderText={placeholderText}
                ref={containerRef}
                searchPattern={searchPattern}
                searchValue={searchValue}
                searchable={searchable}
                selectControlButtonsContainerStyle={selectControlButtonsContainerStyle}
                selectControlClearOptionA11yLabel={selectControlClearOptionA11yLabel}
                selectControlClearOptionButtonHitSlop={selectControlClearOptionButtonHitSlop}
                selectControlClearOptionButtonStyle={selectControlClearOptionButtonStyle}
                selectControlClearOptionImageStyle={selectControlClearOptionImageStyle}
                selectControlCloseDropdownA11yLabel={selectControlCloseDropdownA11yLabel}
                selectControlDisabledStyle={selectControlDisabledStyle}
                selectControlOpenDropdownA11yLabel={selectControlOpenDropdownA11yLabel}
                selectControlStyle={selectControlStyle}
                selectControlTextStyle={selectControlTextStyle}
                selectedOption={selectedOption}
                setPosition={setPosition}
            />
            <OptionsList
                NoOptionsComponent={NoOptionsComponent}
                OptionComponent={OptionComponent}
                aboveSelectControl={aboveSelectControl}
                flatListProps={flatListProps}
                isOpened={isOpened}
                noOptionsText={noOptionsText}
                onOutsidePress={onOutsidePress}
                onPressOption={onPressOption}
                onSelect={onSelect}
                openedPosition={openedPosition}
                optionSelectedStyle={optionSelectedStyle}
                optionStyle={optionStyle}
                optionTextStyle={optionTextStyle}
                optionsData={optionsData}
                optionsListStyle={optionsListStyle}
                scrollToSelectedOption={scrollToSelectedOption}
                searchValue={searchValue}
                searchable={searchable}
                searchedOptions={searchedOptions}
                selectedOption={selectedOption}
            />
        </View>
    );
});

type Styles = {
    relative: ViewStyle;
};

const styles = StyleSheet.create<Styles>({
    relative: {
        position: 'relative',
    },
});
