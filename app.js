/*
 * Copyright (c) 2017-present, salesforce.com, inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the
 * following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
 * promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';
import {
    Text,
    View,
    ScrollView,
} from 'react-native';

import { createStackNavigator } from 'react-navigation';

import {
    Slider,
    Card,
    ButtonGroup,
    PricingCard
} from 'react-native-elements';
import storeMgr from './StoreMgr';
const ascendingButtons = ['ascending', 'descending'];

class BenchmarkScreen extends React.Component {
    static navigationOptions = {
        title: 'SmartStore Benchmark App'
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedOperationIndex: 0,
            
            // Query
            pageSize: 32,
            queryLimit: 750,
            ascendingIndex: 0,
            useCustomQuery: false,
        
            // Insert
            freshDatabase: true,
            insertRows: 150,

            // Update
            updateFields: 5,
            updateRows: 5,

            result: "0.00"};
        this.updateOperationIndex = this.updateOperationIndex.bind(this);
        this.udpateAscendingIndex = this.udpateAscendingIndex.bind(this);
        storeMgr.createSoups();
    }

    updateOperationIndex(selectedOperationIndex) {
        this.setState({selectedOperationIndex});
    }

    udpateAscendingIndex(ascendingIndex) {
        this.setState({ascendingIndex})
    }

    runBenchmark() {
        switch(this.state.selectedOperationIndex) {
            case 0:
                this.runSelectBenchmark();
                break;
            case 1:
                this.runInsertBenchmark();
                break;
        }
    }

    async runSelectBenchmark() {
        let benchPromise = storeMgr.selectBenchmark(false, ascendingButtons[this.state.ascendingIndex], this.state.pageSize, this.state.queryLimit);
        
        var resultsPromise = benchPromise.then((lastResult) => {
                this.setState({ result: lastResult.toString() });
            })
            .catch((error) => {
                console.log("Select Bench Failed: " + error);
            });

        await Promise.all(resultsPromise, benchPromise);
    }

    async runInsertBenchmark() {
        let benchPromise = storeMgr.insertBenchmark(this.state.insertRows);

        var resultsPromise = benchPromise.then((lastResult) => {
            this.setState({ result: lastResult.toString()});
        })
        .catch((error) => {
            console.log("Insert Bench Failed: " + error);
        });

        await Promise.all(resultsPromise, benchPromise);
    }

    render() {
        const operationButtons = ['Select', 'Insert'];
        const { selectedOperationIndex } = this.state;

        return (
             <View style={{ flex: 1 }}>
                <ButtonGroup
                    onPress={this.updateOperationIndex}
                    selectedIndex={selectedOperationIndex}
                    buttons={operationButtons}
                />

                <ScrollView>
                {this.state.selectedOperationIndex == 0 &&
                <Card title={'Smart Query Builder'}>
                    <Slider
                        value={this.state.pageSize}
                        onValueChange={(value) => this.setState({pageSize: value})}
                        minimumValue={1}
                        maximumValue={100}
                        step={1}
                    />
                    <Text>Page Size: {this.state.pageSize}</Text>

                    <Slider
                        value={this.state.queryLimit}
                        onValueChange={(value) => this.setState({queryLimit: value})}
                        minimumValue={0}
                        maximumValue={1000}
                        step={5}
                    />
                    <Text>Query Limit: {this.state.queryLimit}</Text>

                    <ButtonGroup
                        onPress={this.udpateAscendingIndex}
                        selectedIndex={this.state.ascendingIndex}
                        buttons={ascendingButtons}
                    />
                </Card>
                }

                {this.state.selectedOperationIndex == 1 &&
                <Card title={'Insert Data'}>
                   <Slider
                        value={this.state.insertRows}
                        onValueChange={(value) => this.setState({insertRows: value})}
                        minimumValue={0}
                        maximumValue={1000}
                        step={5}
                    />
                    <Text>Number of Rows to Add: {this.state.insertRows}</Text>
                </Card>
                }
                </ScrollView>
                
                <PricingCard
                    color='#4f9deb'
                    title='Results'
                    price={this.state.result}
                    info={[]}
                    button={{ title: 'Run Benchmark', icon: 'build' }}
                    onButtonPress={() => this.runBenchmark()}
                />
            </View>
        );
    }
}

export const App = createStackNavigator({
    Home: { screen: BenchmarkScreen }
});