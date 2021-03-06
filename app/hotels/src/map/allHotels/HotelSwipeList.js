// @flow

import * as React from 'react';
import { View } from 'react-native';
import { createFragmentContainer, graphql } from 'react-relay';
import Carousel from 'react-native-snap-carousel';
import {
  BottomSheet,
  Device,
  StyleSheet,
  AdaptableLayout,
} from '@kiwicom/react-native-app-shared';
import idx from 'idx';

import HotelSwipeItem from './HotelSwipeItem';
import Address from '../Address';
import type { HotelSwipeList as HotelSwipeListData } from './__generated__/HotelSwipeList.graphql';
import { openHeight, closedHeight } from '../bottomSheetDimensions';
import BottomSheetHandle from '../BottomSheetHandle';

type Props = {|
  data: HotelSwipeListData,
  selectedIndex: number,
  onSnapToItem: (index: number) => void,
  onOpenSingleHotel: (hotelId: string) => void,
|};

type State = {|
  screenWidth: number,
|};

const SNAP_WIDTH = 0.8;

const styles = StyleSheet.create({
  sliderWrapper: {
    height: closedHeight,
  },
  slider: {
    paddingTop: 5,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
});

class HotelSwipeList extends React.Component<Props, State> {
  getCardItemWidth = () => {
    return Device.getWideDeviceThreshold() * SNAP_WIDTH;
  };

  getSelectedAddress = () => {
    const { selectedIndex, data } = this.props;

    return idx(data, _ => _[selectedIndex].node.hotel.address) || {};
  };

  renderItem = ({ item }: { item: Object, index: number }) => {
    const { onOpenSingleHotel } = this.props;

    return (
      <HotelSwipeItem
        width={this.getCardItemWidth()}
        data={item.node}
        onPress={onOpenSingleHotel}
      />
    );
  };

  render = () => {
    const { data, selectedIndex, onSnapToItem } = this.props;

    const child = (
      <BottomSheet openHeight={openHeight} closedHeight={closedHeight}>
        <BottomSheetHandle />
        <View style={styles.sliderWrapper}>
          <Carousel
            data={data}
            renderItem={this.renderItem}
            sliderWidth={Device.getWideDeviceThreshold()}
            itemWidth={this.getCardItemWidth()}
            firstItem={selectedIndex}
            inactiveSlideScale={1}
            inactiveSlideOpacity={0.5}
            decelerationRate="fast"
            activeSlideAlignment="start"
            containerCustomStyle={styles.slider}
            removeClippedSubviews={false}
            onSnapToItem={onSnapToItem}
          />
        </View>
        <Address address={this.getSelectedAddress()} />
      </BottomSheet>
    );

    return (
      <AdaptableLayout
        renderOnWide={
          <View
            style={{ width: '100%', maxWidth: Device.getWideDeviceThreshold() }}
          >
            {child}
          </View>
        }
        renderOnNarrow={<View style={{ width: '100%' }}>{child}</View>}
      />
    );
  };
}

export default createFragmentContainer(
  HotelSwipeList,
  graphql`
    fragment HotelSwipeList on HotelAvailabilityEdge @relay(plural: true) {
      node {
        id
        ...HotelSwipeItem
        hotel {
          address {
            ...Address_address
          }
        }
      }
    }
  `,
);
